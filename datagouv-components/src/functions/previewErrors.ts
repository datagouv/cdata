import { getResourceCorsStatus, isTabularPipelineFormat } from './resources'
import type { Resource } from '../types/resources'
import { useTranslation } from '../composables/useTranslation'

export type PreviewErrorType
  = | 'cors'
    | 'network'
    | 'unavailable'
    | 'too_large'
    | 'malformed'
    | 'unknown'
    | 'none'

export type PreviewErrorInfo = {
  type: PreviewErrorType
  message: string
  userCta?: string
  producerCta?: string
}

/**
 * Determine the type of preview error based on resource metadata
 */
function getPreviewErrorType(resource: Resource): PreviewErrorType {
  const extras = resource.extras

  // A diagnosed availability failure (the robot's check could not reach the
  // file) is the actual cause: like the runtime wrapper (PreviewWrapper), it
  // wins over the size/CORS/status heuristics, which would blame the file for
  // not loading.
  if (extras['check:available'] === false) {
    return 'unavailable'
  }

  // Mirrors the wrapper's ordering: CORS knowledge (the checker recorded a
  // blocked origin) comes before the size/quota heuristics. Tabular files
  // are ignored for CORS.
  if (!isTabularPipelineFormat(resource.format) && getResourceCorsStatus(resource) === 'blocked') {
    return 'cors'
  }

  // Check for file too large
  if (extras['analysis:error'] === 'File too large to download') {
    return 'too_large'
  }

  // Check for parsing errors (malformed)
  if (extras['analysis:parsing:error']) {
    return 'malformed'
  }

  // Check for general analysis errors
  if (extras['analysis:error']) {
    return 'unknown'
  }

  return 'none'
}

/**
 * Get error information for a known preview error type
 */
export function getPreviewErrorInfoByType(errorType: PreviewErrorType, resource?: Resource): PreviewErrorInfo {
  // Translated at call time so the strings track the detected locale: the keys
  // are the French texts, like everywhere else in the package (e.g.
  // `getResourceLabel`).
  const { t } = useTranslation()

  switch (errorType) {
    case 'cors':
      return {
        type: 'cors',
        message: t('Ce fichier est hébergé sur un site externe qui n’autorise pas son affichage dans data.gouv.fr.'),
        userCta: t('Signaler un problème avec cet aperçu'),
        producerCta: t('Signaler un problème'),
      }

    case 'network':
      return {
        type: 'network',
        message: t('Ce fichier hébergé sur un site externe n’a pas pu être chargé.'),
        userCta: t('Signaler un problème avec cet aperçu'),
        producerCta: t('Signaler un problème'),
      }

    case 'unavailable':
      return {
        type: 'unavailable',
        message: t('Ce fichier est hébergé sur un site externe et n’est pas disponible'),
        userCta: t('Signaler un problème avec cet aperçu'),
        producerCta: t('Signaler un problème'),
      }

    case 'too_large':
      return {
        type: 'too_large',
        message: t('Ce fichier est trop volumineux pour être prévisualisé.'),
        // Only tabular-pipeline files can be re-processed server-side with a
        // larger quota: asking for it on a client-side preview (PDF…) is noise.
        userCta: resource && isTabularPipelineFormat(resource.format) ? t('Cette prévisualisation vous serait utile ?') : '',
        producerCta: t('Cette prévisualisation vous serait utile ?'),
      }

    case 'malformed':
      return {
        type: 'malformed',
        message: t('La structure de ce fichier ne permet pas d\'afficher son aperçu'),
        userCta: '',
        producerCta: t('Signaler un problème'),
      }

    case 'none':
      return {
        type: 'none',
        message: t('Ce fichier ne peut pas être prévisualisé.'),
        userCta: '',
        producerCta: '',
      }

    case 'unknown':
    default:
      return {
        type: 'unknown',
        message: t('Une erreur a empêché le chargement de l\'aperçu de ce fichier.'),
        userCta: t('Signaler un problème avec cet aperçu'),
        producerCta: t('Signaler un problème'),
      }
  }
}

/**
 * Get error information for preview failures
 */
export function getPreviewErrorInfo(resource: Resource): PreviewErrorInfo {
  return getPreviewErrorInfoByType(getPreviewErrorType(resource), resource)
}

/**
 * Check if a resource has any preview error
 */
export function hasPreviewError(resource: Resource): boolean {
  return getPreviewErrorType(resource) !== 'none'
}
