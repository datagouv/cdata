export type TranslationOptions = Record<string, string | number>

function interpolate(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match
  })
}

function handlePluralization(key: string, count: number): string {
  // Séparer les formes avec |
  const parts = key.split('|').map(part => part.trim())

  if (parts.length === 1) {
    // Pas de pluralisation
    return parts[0]
  }

  if (parts.length === 2) {
    // Syntaxe simple : singulier | pluriel
    // Logique française : 0 ou 1 = singulier, > 1 = pluriel
    return count <= 1 ? parts[0] : parts[1]
  }

  if (parts.length >= 3) {
    // Syntaxe complète : zero | one | many
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

    // Gérer la pluralisation si 'n' ou 'count' est présent
    const count = options?.n ?? options?.count
    if (count !== undefined) {
      result = handlePluralization(result, Number(count))
    }

    // Gérer l'interpolation
    if (options && Object.keys(options).length > 0) {
      result = interpolate(result, options)
    }

    return result
  }

  return {
    t,
  }
}

// Export direct de la fonction pour usage hors composants
export const t = (key: string, options?: TranslationOptions): string => {
  const { t: translate } = useTranslation()
  return translate(key, options)
}
