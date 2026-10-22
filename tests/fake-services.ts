// Serves the third-party services the app calls (metrics API, matomo.js, Tabular API) when the
// server under test points them here (NUXT_PUBLIC_METRICS_API, NUXT_PUBLIC_MATOMO_HOST,
// NUXT_PUBLIC_TABULAR_API_URL). Faking them with a Playwright route instead makes the browser
// hand every request of the page to Playwright and turns its HTTP cache off, and cannot reach
// the requests the Nuxt server makes itself.
//
// With FAKE_SERVICES_RECORD set, the Tabular API requests go to the real API and are recorded
// as fixtures (tests/tabularFixtures.ts): run the suite once that way after a change of the
// requests the app makes.
import { createServer } from 'node:http'
import { MATOMO_SCRIPT } from './matomo.ts'
import { CORS_HEADERS, metricsApiResponse } from './metricsApi.ts'
import { REAL_TABULAR_API, REAL_TABULAR_API_TIMEOUT, readTabularFixture, tabularRequestKey, writeTabularFixture, type TabularFixture } from './tabularFixtures.ts'

const origin = process.env.FAKE_SERVICES_URL || 'http://localhost:3100'
const TABULAR_PREFIX = '/tabular'

async function recordTabularResponse(request: string): Promise<TabularFixture> {
  try {
    const real = await fetch(new URL(request, REAL_TABULAR_API), { signal: AbortSignal.timeout(REAL_TABULAR_API_TIMEOUT) })
    const fixture = { request, status: real.status, contentType: real.headers.get('content-type') ?? 'application/json', body: await real.text() }
    // A gateway error says nothing of the API: never replay it
    if (fixture.status < 500) writeTabularFixture(fixture)
    return fixture
  }
  catch (error) {
    console.error(`Tabular API did not answer ${request}: ${error}`)
    return { request, status: 504, contentType: 'text/plain', body: `Tabular API did not answer ${request}` }
  }
}

async function tabularResponse(url: URL): Promise<TabularFixture> {
  const request = tabularRequestKey(url.pathname.slice(TABULAR_PREFIX.length), url.search)
  const fixture = readTabularFixture(request)
  // Recording only fetches what is missing, so that a run fills the gaps of the previous ones
  if (fixture) return fixture
  if (process.env.FAKE_SERVICES_RECORD) return recordTabularResponse(request)
  console.error(`No Tabular API fixture for ${request}: record it with FAKE_SERVICES_RECORD (see tests/fake-services.ts)`)
  return { request, status: 404, contentType: 'text/plain', body: `No fixture for ${request}` }
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', origin)
  const { status = 200, contentType, body }: { status?: number, contentType: string, body: string } = url.pathname.startsWith(`${TABULAR_PREFIX}/`)
    ? await tabularResponse(url)
    : url.pathname === '/matomo.js' ? MATOMO_SCRIPT : metricsApiResponse(url)
  response.writeHead(status, { 'Content-Type': contentType, ...CORS_HEADERS })
  response.end(body)
}).listen(new URL(origin).port)
