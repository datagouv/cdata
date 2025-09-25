import { useTranslation } from '../composables/useTranslation'

const SECONDS_IN_A_DAY = 3600 * 24

export function useFormatDate() {
  const { t, locale } = useTranslation()

  const formatDate = (date: Date | string | null | undefined, options: Intl.DateTimeFormatOptions = {}) => {
    if (!date) {
      return ''
    }
    date = new Date(date)
    if (!('dateStyle' in options)) {
      options.dateStyle = 'long'
    }
    return new Intl.DateTimeFormat(locale, options).format(date)
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
    const diff = Math.abs(dateWithoutTime.getTime() - today.getTime())
    if (Math.round(diff / (SECONDS_IN_A_DAY * 30)) >= 1) {
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
