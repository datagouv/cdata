import { describe, expect, it } from 'vitest'
import { sentrySecurityEndpoint } from '~/utils/sentry-security-endpoint'

describe('sentrySecurityEndpoint', () => {
  it('builds the endpoint of a self-hosted DSN with an empty path', () => {
    // The DSN of data.gouv.fr, where the project follows a double slash
    expect(sentrySecurityEndpoint('https://41bc422f2d704f5bab0981b59f449328@errors.data.gouv.fr//30', 'https://www.data.gouv.fr'))
      .toBe('https://errors.data.gouv.fr/api/30/security/?sentry_key=41bc422f2d704f5bab0981b59f449328&sentry_environment=www.data.gouv.fr')
  })

  it('builds the endpoint of a sentry.io DSN', () => {
    expect(sentrySecurityEndpoint('https://abc123@o42.ingest.sentry.io/1234', 'http://dev.local:7000'))
      .toBe('https://o42.ingest.sentry.io/api/1234/security/?sentry_key=abc123&sentry_environment=dev.local%3A7000')
  })

  it('keeps the path of a Sentry served under a prefix', () => {
    expect(sentrySecurityEndpoint('https://abc123@example.org/sentry/7', 'https://demo.data.gouv.fr'))
      .toBe('https://example.org/sentry/api/7/security/?sentry_key=abc123&sentry_environment=demo.data.gouv.fr')
  })
})
