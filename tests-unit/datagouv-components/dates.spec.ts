import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { useFormatDate } from '~/datagouv-components/src/functions/dates'

// All dates are relative to a frozen "now" (locale is fr in the test env)
const NOW = new Date(2026, 5, 10, 12, 0, 0)
const daysFromNow = (days: number) => new Date(2026, 5, 10 + days, 12, 0, 0)

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterAll(() => {
  vi.useRealTimers()
})

describe('formatFromNow', () => {
  it('formats around today', () => {
    const { formatFromNow } = useFormatDate()
    expect(formatFromNow(daysFromNow(0))).toEqual('aujourd’hui')
    expect(formatFromNow(daysFromNow(-5))).toEqual('il y a 5 jours')
    expect(formatFromNow(daysFromNow(5))).toEqual('dans 5 jours')
  })

  it('switches from days to months after 30 days, to years after 12 months', () => {
    const { formatFromNow } = useFormatDate()
    expect(formatFromNow(daysFromNow(-29))).toEqual('il y a 29 jours')
    expect(formatFromNow(daysFromNow(-50))).toEqual('il y a 2 mois')
    expect(formatFromNow(daysFromNow(-800))).toEqual('il y a 2 ans')
  })

  it('returns an empty string without a date', () => {
    const { formatFromNow } = useFormatDate()
    expect(formatFromNow(null)).toEqual('')
    expect(formatFromNow(undefined)).toEqual('')
  })
})

describe('formatMonth', () => {
  // A month carries no timezone, so the helper has to hold in a zone where midnight
  // UTC still falls on the previous month — which is exactly where parsing the string
  // as an instant gives the wrong answer.
  beforeAll(() => vi.stubEnv('TZ', 'America/Cayenne'))
  afterAll(() => vi.unstubAllEnvs())

  it('reads the month off the string instead of parsing it as an instant', () => {
    const { formatMonth } = useFormatDate()
    expect(formatMonth('2026-04')).toEqual('avril 2026')
    expect(formatMonth('2022-07-01')).toEqual('juillet 2022')
  })

  it('takes the month a date falls in, and the asked-for wording', () => {
    const { formatMonth } = useFormatDate()
    expect(formatMonth(new Date(2026, 3, 15))).toEqual('avril 2026')
    expect(formatMonth('2026-04', { year: 'numeric', month: 'short' })).toEqual('avr. 2026')
  })

  it('returns an empty string without a usable value', () => {
    const { formatMonth } = useFormatDate()
    expect(formatMonth(null)).toEqual('')
    expect(formatMonth(undefined)).toEqual('')
    expect(formatMonth('not a date')).toEqual('')
  })
})

describe('formatRelativeIfRecentDate', () => {
  it('is relative under a month', () => {
    const { formatRelativeIfRecentDate } = useFormatDate()
    // Regression: a ms/seconds confusion used to make any date other than
    // today fall through to the absolute format
    expect(formatRelativeIfRecentDate(daysFromNow(-5))).toEqual('il y a 5 jours')
    expect(formatRelativeIfRecentDate(daysFromNow(-29))).toEqual('il y a 29 jours')
  })

  it('is an absolute date from 30 days on', () => {
    const { formatRelativeIfRecentDate } = useFormatDate()
    expect(formatRelativeIfRecentDate(daysFromNow(-30))).toEqual('le 11 mai 2026')
    expect(formatRelativeIfRecentDate(daysFromNow(-365))).toEqual('le 10 juin 2025')
  })
})
