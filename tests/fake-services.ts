// Serves the assistant test endpoint and external services (metrics API, matomo.js, Tabular API)
// when the server under test points them here. Faking them with a Playwright route instead makes
// the browser hand every request of the page to Playwright and turns its HTTP cache off, and cannot
// reach the requests the Nuxt server makes itself.
//
// With FAKE_SERVICES_RECORD set, the Tabular API requests go to the real API and are recorded
// as fixtures (tests/tabularFixtures.ts): run the suite once that way after a change of the
// requests the app makes.
import { createServer } from 'node:http'
import { ASSISTANT_CHAT_PATH, assistantChatStream } from './assistantApi.ts'
import { MATOMO_SCRIPT } from './matomo.ts'
import { CORS_HEADERS, metricsApiResponse } from './metricsApi.ts'
import { REAL_TABULAR_API, REAL_TABULAR_API_TIMEOUT, readTabularFixture, tabularRequestKey, writeTabularFixture, type TabularFixture } from './tabularFixtures.ts'

// Started by Playwright with FAKE_SERVICES_PORT matching FAKE_SERVICES_URL (see
// playwright.config.ts): FAKE_SERVICES_URL must stay a local URL.
const origin = process.env.FAKE_SERVICES_URL || `http://localhost:${process.env.FAKE_SERVICES_PORT || 3100}`
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
  if (url.pathname === ASSISTANT_CHAT_PATH) {
    const requestOrigin = request.headers.origin
    const corsHeaders = {
      ...(requestOrigin
        ? {
            'Access-Control-Allow-Origin': requestOrigin,
            'Access-Control-Allow-Credentials': 'true',
            'Vary': 'Origin',
          }
        : {}),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': request.headers['access-control-request-headers'] ?? 'content-type',
    }

    if (request.method === 'OPTIONS') {
      response.writeHead(204, corsHeaders)
      response.end()
      return
    }

    if (request.method !== 'POST') {
      response.writeHead(405, { ...corsHeaders, 'Allow': 'POST, OPTIONS', 'Content-Type': 'text/plain' })
      response.end('Method not allowed')
      return
    }

    response.writeHead(200, {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'x-vercel-ai-ui-message-stream': 'v1',
      'x-accel-buffering': 'no',
    })
    response.end(assistantChatStream())
    return
  }

  const { status = 200, contentType, body }: { status?: number, contentType: string, body: string } = url.pathname.startsWith(`${TABULAR_PREFIX}/`)
    ? await tabularResponse(url)
    : url.pathname === '/matomo.js' ? MATOMO_SCRIPT : metricsApiResponse(url)
  response.writeHead(status, { 'Content-Type': contentType, ...CORS_HEADERS })
  response.end(body)
}).listen(new URL(origin).port)
