export const filesize = (val: number) => {
  const { t, locale } = useI18n()
  const suffix = t('o')
  const formatter = new Intl.NumberFormat(locale.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  const units = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z']
  for (const unit of units) {
    if (Math.abs(val) < 1024.0) {
      return `${formatter.format(val)} ${unit}${suffix}`.trim()
    }
    val /= 1024.0
  }
  return `${formatter.format(val)} Y${suffix}`.trim()
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
