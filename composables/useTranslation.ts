import { ref, readonly } from 'vue'

export type TranslationOptions = Record<string, string | number>

const PLACEHOLDER_REGEX = /\{(\w+)\}/g

// Pre-register all available translation files at build time
const translationModules = import.meta.glob('/locales/*.json')

// Global state for loaded translations
const translationsCache = new Map<string, Record<string, string>>()

function detectLanguage(): string {
  // Server-side (Nuxt)
  try {
    const headers = useRequestHeaders()
    const acceptLanguage = headers['accept-language']
    if (acceptLanguage) {
      const primaryLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase()
      return primaryLang
    }
  }
  catch {
    // Fallback if not in Nuxt context
  }

  // Client-side
  if (typeof window !== 'undefined' && navigator.language) {
    return navigator.language.split('-')[0].toLowerCase()
  }

  return 'fr'
}

async function loadTranslations(lang: string): Promise<Record<string, string> | null> {
  if (lang === 'fr') return null // French is the default

  if (translationsCache.has(lang)) {
    return translationsCache.get(lang)!
  }

  const modulePath = `/locales/${lang}.json`
  const moduleLoader = translationModules[modulePath]

  if (!moduleLoader) {
    return null // Translation file doesn't exist
  }

  try {
    const module = await moduleLoader()
    const translationData = module.default || module
    translationsCache.set(lang, translationData)
    return translationData
  }
  catch {
    return null
  }
}

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

export const useTranslation = async () => {
  const currentLang = ref(detectLanguage())
  const translations = ref<Record<string, string> | null>(null)
  const isLoading = ref(false)

  // Load translations if not French
  const loadCurrentTranslations = async () => {
    if (currentLang.value !== 'fr' && !translations.value && !isLoading.value) {
      isLoading.value = true
      try {
        translations.value = await loadTranslations(currentLang.value)
      }
      finally {
        isLoading.value = false
      }
    }
  }

  // Initialize translations loading
  await loadCurrentTranslations()

  const t = (key: string, options?: TranslationOptions): string => {
    let result = key

    // Try to get translation from loaded translations first
    if (translations.value && translations.value[key]) {
      result = translations.value[key]
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

  return {
    t,
    currentLang: readonly(currentLang),
    loadCurrentTranslations,
  }
}

export const t = async (key: string, options?: TranslationOptions): Promise<string> => {
  const { t: translate } = await useTranslation()
  return translate(key, options)
}
