// Serves the third-party services the app calls from the browser (metrics API, matomo.js) when
// the server under test points them here (NUXT_PUBLIC_METRICS_API, NUXT_PUBLIC_MATOMO_HOST).
// Faking them with a Playwright route instead makes the browser hand every request of the
// page to Playwright, and turns its HTTP cache off.
import { createServer } from 'node:http'
import { MATOMO_SCRIPT } from './matomo.ts'
import { CORS_HEADERS, metricsApiResponse } from './metricsApi.ts'

const origin = process.env.FAKE_SERVICES_URL || 'http://localhost:3100'

createServer((request, response) => {
  const url = new URL(request.url ?? '/', origin)
  const { contentType, body } = url.pathname === '/matomo.js' ? MATOMO_SCRIPT : metricsApiResponse(url)
  response.writeHead(200, { 'Content-Type': contentType, ...CORS_HEADERS })
  response.end(body)
}).listen(new URL(origin).port)
