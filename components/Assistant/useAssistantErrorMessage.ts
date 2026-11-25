import { useTranslation } from '@datagouv/components-next'

/**
 * The message shown for an error surfaced by useChat. HTTP failures carry a
 * `statusCode` (APICallError from the transport). An error event of the stream
 * becomes a plain Error holding udata's text, already localized: it says whether
 * waiting helps. Anything else is a network or unknown failure.
 */
export function useAssistantErrorMessage() {
  const { t } = useTranslation()

  return (error: unknown): string => {
    const statusCode = (error as { statusCode?: unknown } | null)?.statusCode
    if (statusCode === 401) return t('Veuillez vous reconnecter pour utiliser l’assistant.')
    // udata can no longer read the conversation it stored: only a new one helps.
    if (statusCode === 409) return t('Cette conversation ne peut plus être lue.')
    if (statusCode === 413) return t('Votre message est trop long.')
    if (statusCode === 429) return t('Trop de demandes, réessayez dans un instant.')
    if (statusCode === 503) return t('Assistant indisponible pour le moment.')
    // A failed fetch is a TypeError, the SDK's own errors have an AI_ name.
    if (statusCode === undefined && error instanceof Error && error.name === 'Error' && error.message) return error.message
    return t('Une erreur est survenue, veuillez réessayer.')
  }
}
