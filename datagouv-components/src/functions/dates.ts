import { useTranslation } from '../composables/useTranslation'

const SECONDS_IN_A_DAY = 3600 * 24

/**
 * `2026`, `2026-04` and `2026-04-24` carry no time of day. `new Date()` reads them as
 * midnight UTC, an instant they never claimed, and then converts it: a reader west of
 * UTC gets the day before — and with it the month, and sometimes the year.
 */
export const PLAIN_DATE = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/

/**
 * A date value read as the day it names. A plain date is built in local time, where no
 * conversion can move it; anything else is an instant and keeps being read as one.
 */
export function parseDateValue(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  const plain = typeof value === 'string' ? value.match(PLAIN_DATE) : null
  const date = plain
    ? new Date(Number(plain[1]), Number(plain[2] ?? 1) - 1, Number(plain[3] ?? 1))
    : new Date(value)
  return isNaN(date.getTime()) ? null : date
}

export function useFormatDate() {
  const { t, locale } = useTranslation()

  const formatDate = (date: Date | string | null | undefined, options: Intl.DateTimeFormatOptions = {}) => {
    if (!date) {
      return ''
    }
    // An explicit `dateStyle: undefined` overrides the default, which is how callers ask
    // for `year`/`month` components — `dateStyle` and those cannot be combined.
    return new Intl.DateTimeFormat(locale, { dateStyle: 'long', ...options }).format(new Date(date))
  }

  /**
   * Format date as relative from now.
   * It displays "today" or Intl.RelativeTimeFormat content, based on date.
   */
  const formatFromNow = (date: Date | string | null | undefined) => {
    if (!date) {
      return ''
    }
    if (!('RelativeTimeFormat' in Intl)) {
      return t('le {date}', { date: formatDate(date) })
    }
    const today = new Date()
    today.setHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    const dateWithoutTime = new Date(date)
    dateWithoutTime.setHours(0)
    dateWithoutTime.setMinutes(0)
    dateWithoutTime.setSeconds(0)
    // Get the diff in second between today and the provided date
    const diff = Math.round((dateWithoutTime.getTime() - today.getTime()) / 1000)
    const units: Array<{ unit: Intl.RelativeTimeFormatUnit, seconds: number, changeAfter: number }> = [
      {
        unit: 'day',
        seconds: SECONDS_IN_A_DAY,
        changeAfter: 30,
      },
      {
        unit: 'month',
        seconds: SECONDS_IN_A_DAY * 30,
        changeAfter: 12,
      },
      {
        unit: 'year',
        seconds: SECONDS_IN_A_DAY * 365,
        changeAfter: Infinity,
      },
    ]
    const correctUnit = units.find((unit) => {
      const diffInUnit = Math.abs(diff / unit.seconds)
      return diffInUnit < unit.changeAfter
    })!
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(Math.round(diff / correctUnit?.seconds), correctUnit?.unit)
  }

  /**
   * Format date relative form now if date is less than a month ago.
   * Otherwise, show a formatted date.
   */
  const formatRelativeIfRecentDate = (date: Date | string | null | undefined, options: Intl.DateTimeFormatOptions = {}) => {
    if (!date) {
      return ''
    }
    const today = new Date()
    today.setHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    const dateWithoutTime = new Date(date)
    dateWithoutTime.setHours(0)
    dateWithoutTime.setMinutes(0)
    dateWithoutTime.setSeconds(0)
    // `getTime()` returns milliseconds, `SECONDS_IN_A_DAY` is in seconds
    const diffInSeconds = Math.abs(dateWithoutTime.getTime() - today.getTime()) / 1000
    if (diffInSeconds >= SECONDS_IN_A_DAY * 30) {
      return t('le {date}', { date: formatDate(date, options) })
    }
    return formatFromNow(date)
  }

  return {
    formatDate,
    formatFromNow,
    formatRelativeIfRecentDate,
  }
}
