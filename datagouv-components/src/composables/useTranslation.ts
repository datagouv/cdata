import { ref } from 'vue'

// Declare useRequestHeaders for TypeScript (Nuxt composable)
declare const useRequestHeader: ((header: string) => string | undefined) | undefined

export type TranslationOptions = Record<string, string | number>

const PLACEHOLDER_REGEX = /\{(\w+)\}/g

// Pre-register all available translation files at build time
const translationModules = import.meta.glob<Record<string, string>>('../../../locales/*.json', {
  import: 'default',
})

function detectLanguage(): string {
  // Server-side (Nuxt)
  try {
    const header = useRequestHeader?.('accept-language')
    const acceptLanguage = header
    if (acceptLanguage) {
      const primaryLang = acceptLanguage.split(';')[0]!.split(',')[0]!.split('-')[0]!.toLowerCase()
      return primaryLang
    }
  }
  catch {
    // useRequestHeaders not available, continue to client-side detection
  }

  // Client-side
  if (typeof window !== 'undefined' && navigator.language) {
    return navigator.language.split('-')[0]!.toLowerCase()
  }

  return 'fr'
}

async function loadTranslationFile(lang: string): Promise<Record<string, string>> {
  const modulePath = `../../../locales/${lang}.json`
  const moduleLoader = translationModules[modulePath]

  if (!moduleLoader) {
    return {} // Translation file doesn't exist
  }

  try {
    return await moduleLoader()
  }
  catch {
    return {}
  }
}

function interpolate(text: string, values: Record<string, string | number>): string {
  return text.replace(PLACEHOLDER_REGEX, (match, key) => {
    return key in values ? String(values[key]) : match
  })
}

export function extractPlaceholders(text: string): string[] {
  const placeholders: string[] = []
  const regex = new RegExp(PLACEHOLDER_REGEX.source, PLACEHOLDER_REGEX.flags)
  let match

  while ((match = regex.exec(text)) !== null) {
    placeholders.push(match[1]!)
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
    return parts[0]!
  }

  if (parts.length === 2) {
    // French pluralization rule: 0 or 1 = singular, > 1 = plural
    return count <= 1 ? parts[0]! : parts[1]!
  }

  if (parts.length >= 3) {
    if (count === 0) {
      return parts[0]!
    }
    else if (count === 1) {
      return parts[1]!
    }
    else {
      return parts[2]!
    }
  }

  return parts[0]!
}

const translations = ref<Record<string, Record<string, string>>>({})

export const loadCurrentTranslations = async () => {
  const currentLang = detectLanguage()
  if (currentLang in translations.value) {
    // Already loaded
    return
  }

  translations.value[currentLang] = await loadTranslationFile(currentLang)
}

export const useTranslation = () => {
  const locale = detectLanguage()

  // Initialize translations if not already done.
  loadCurrentTranslations()

  const t = (key: string, options?: TranslationOptions | number): string => {
    let result = key

    if (typeof options == 'number') {
      options = { count: options, n: options }
    }

    // Try to get translation from loaded translations first
    if (translations.value && translations.value[locale] && translations.value[locale][key]) {
      result = translations.value[locale][key]
    }

    const count = options?.n ?? options?.count
    if (count !== undefined) {
      result = handlePluralization(result, Number(count))
    }

    if (options && Object.keys(options).length > 0) {
      result = interpolate(result, options)
    }

    return result
  }

  return { t, locale }
}

export const t = async (key: string, options?: TranslationOptions): Promise<string> => {
  const { t: translate } = useTranslation()
  return translate(key, options)
}
