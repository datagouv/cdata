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
