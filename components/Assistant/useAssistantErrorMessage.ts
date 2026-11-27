import { useTranslation } from '@datagouv/components-next'
import { getApiErrorMessage } from '~/utils/api'

/** The HTTP status of a request udata refused (APICallError from the transport), undefined otherwise. */
export function errorStatusCode(error: unknown): number | undefined {
  const statusCode = (error as { statusCode?: unknown } | null | undefined)?.statusCode
  return typeof statusCode === 'number' ? statusCode : undefined
}

function udataMessage(error: unknown): string {
  const body = (error as { responseBody?: unknown }).responseBody
  if (typeof body !== 'string') return ''
  try {
    return getApiErrorMessage(JSON.parse(body))
  }
  catch {
    return ''
  }
}

/**
 * The message shown for an error surfaced by useChat. A 4xx other than 401 and 413
 * shows udata's own localized message when its body has one. An error event of the stream becomes
 * a plain Error holding udata's text, already localized: it says whether waiting
 * helps. Anything else is a network or unknown failure.
 */
export function useAssistantErrorMessage() {
  const { t } = useTranslation()

  return (error: unknown): string => {
    const statusCode = errorStatusCode(error)
    // 401 and the oversized-body 413 are bare aborts (werkzeug's English); both 413s look alike, so both get the local text.
    if (statusCode === 401) return t('Veuillez vous reconnecter pour utiliser l’assistant.')
    if (statusCode === 413) return t('Votre message est trop long.')
    if (statusCode !== undefined && statusCode >= 400 && statusCode < 500) {
      const message = udataMessage(error)
      if (message) return message
    }
    if (statusCode === 409) return t('Cette conversation ne peut pas continuer.')
    if (statusCode === 429) return t('Trop de demandes, réessayez dans un instant.')
    if (statusCode === 503) return t('Assistant indisponible pour le moment.')
    // A failed fetch is a TypeError, the SDK's own errors have an AI_ name.
    if (statusCode === undefined && error instanceof Error && error.name === 'Error' && error.message) return error.message
    return t('Une erreur est survenue, veuillez réessayer.')
  }
}
