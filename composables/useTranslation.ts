export type TranslationOptions = Record<string, string | number>

const PLACEHOLDER_REGEX = /\{(\w+)\}/g

function interpolate(text: string, values: Record<string, string | number>): string {
  return text.replace(PLACEHOLDER_REGEX, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match
  })
}

export function extractPlaceholders(text: string): string[] {
  const placeholders: string[] = []
  const regex = new RegExp(PLACEHOLDER_REGEX.source, PLACEHOLDER_REGEX.flags)
  let match

  while ((match = regex.exec(text)) !== null) {
    placeholders.push(match[1])
  }

  return placeholders
}

export function parseTextWithPlaceholders(text: string): Array<{ text?: string, placeholder?: string }> {
  const result: Array<{ text?: string, placeholder?: string }> = []
  const regex = new RegExp(PLACEHOLDER_REGEX.source, PLACEHOLDER_REGEX.flags)
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({ text: text.slice(lastIndex, match.index) })
    }

    result.push({ placeholder: match[1] })

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    result.push({ text: text.slice(lastIndex) })
  }

  return result
}

function handlePluralization(key: string, count: number): string {
  const parts = key.split('|').map(part => part.trim())

  if (parts.length === 1) {
    return parts[0]
  }

  if (parts.length === 2) {
    // French pluralization rule: 0 or 1 = singular, > 1 = plural
    return count <= 1 ? parts[0] : parts[1]
  }

  if (parts.length >= 3) {
    if (count === 0) {
      return parts[0]
    }
    else if (count === 1) {
      return parts[1]
    }
    else {
      return parts[2]
    }
  }

  return parts[0]
}

export const useTranslation = () => {
  const t = (key: string, options?: TranslationOptions): string => {
    let result = key

    const count = options?.n ?? options?.count
    if (count !== undefined) {
      result = handlePluralization(result, Number(count))
    }

    if (options && Object.keys(options).length > 0) {
      result = interpolate(result, options)
    }

    return result
  }

  return {
    t,
  }
}

export const t = (key: string, options?: TranslationOptions): string => {
  const { t: translate } = useTranslation()
  return translate(key, options)
}
