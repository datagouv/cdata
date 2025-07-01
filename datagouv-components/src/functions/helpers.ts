import { useI18n } from 'vue-i18n'

export const filesize = (val: number) => {
  const { t } = useI18n()
  const suffix = t('O')
  const units = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z']
  for (const unit of units) {
    if (Math.abs(val) < 1024.0) {
      return `${val.toFixed(1)}${unit}${suffix}`
    }
    val /= 1024.0
  }
  return `${val.toFixed(1)}Y${suffix}`
}

export const summarize = (val: number, fractionDigits = 0) => {
  const toFixedIfNotZero = (value: number) => {
    const asString = value.toFixed(fractionDigits)
    if (!asString.includes('.')) {
      return asString
    }

    // Remove trailing "0" to not show "1.0" but only "1"
    return asString.replace(/0+$/, '').replace(/\.$/, '')
  }

  if (!val) {
    return '0'
  }
  const units = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z']
  for (const unit of units) {
    if (Math.abs(val) < 1000.0) {
      return `${toFixedIfNotZero(val)}${unit}`
    }
    val /= 1000.0
  }
  return `${toFixedIfNotZero(val)}Y`
}
