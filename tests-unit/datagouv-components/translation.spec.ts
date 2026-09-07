import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTranslation } from '~/datagouv-components/src/composables/useTranslation'

const withAcceptLanguage = (header: string | undefined) => {
  vi.stubGlobal('useRequestHeader', (name: string) => name === 'accept-language' ? header : undefined)
  return useTranslation().locale
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('locale detection', () => {
  it('uses the language subtag of the accept-language header', () => {
    expect(withAcceptLanguage('fr')).toEqual('fr')
    expect(withAcceptLanguage('en-US,en;q=0.9')).toEqual('en')
    expect(withAcceptLanguage('DE-de')).toEqual('de')
  })

  it('falls back to french on a header without a usable language', () => {
    // Regression: a malformed header used to be passed as-is to `Intl`, which
    // throws a RangeError and made the whole server-side render fail
    expect(withAcceptLanguage('en_US')).toEqual('fr')
    expect(withAcceptLanguage('*')).toEqual('fr')
    expect(withAcceptLanguage(';q=0.9')).toEqual('fr')
    expect(withAcceptLanguage('1')).toEqual('fr')
    expect(withAcceptLanguage('')).toEqual('fr')
    expect(withAcceptLanguage(undefined)).toEqual('fr')
  })

  it('always returns a locale every Intl formatter accepts', () => {
    for (const header of ['fr', 'en-US,en;q=0.9', 'en_US', '*', ';q=0.9', '1', '', undefined]) {
      const locale = withAcceptLanguage(header)
      expect(() => new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })).not.toThrow()
      expect(() => new Intl.DateTimeFormat(locale)).not.toThrow()
      expect(() => new Intl.NumberFormat(locale)).not.toThrow()
    }
  })
})
