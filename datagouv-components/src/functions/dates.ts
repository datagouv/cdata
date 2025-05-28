import { useI18n } from 'vue-i18n'

const SECONDS_IN_A_DAY = 3600 * 24

export function formatDate(date: Date | string | null, options: Intl.DateTimeFormatOptions = {}) {
  if (!date) {
    return ''
  }
  date = new Date(date)
  if (!('dateStyle' in options)) {
    options.dateStyle = 'long'
  }
  const { locale } = useI18n()
  return new Intl.DateTimeFormat(locale.value, options).format(date)
}

/**
 * Format date as relative from now.
 * It displays "today" or Intl.RelativeTimeFormat content, based on date.
 */
export const formatFromNow = (date: Date | string | null) => {
  if (!date) {
    return ''
  }
  const { t, locale } = useI18n()
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
  return new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' }).format(Math.round(diff / correctUnit?.seconds), correctUnit?.unit)
}

/**
 * Format date relative form now if date is less than a month ago.
 * Otherwise, show a formatted date.
 */
export const formatRelativeIfRecentDate = (date: Date | string | null, options: Intl.DateTimeFormatOptions = {}) => {
  if (!date) {
    return ''
  }
  const { t } = useI18n()
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
