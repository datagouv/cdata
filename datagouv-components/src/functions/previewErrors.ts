import { hasTabularParsingError, isTabularPipelineFormat } from './resources'
import type { Resource } from '../types/resources'
import { useTranslation } from '../composables/useTranslation'

// Every error type, whether diagnosed from the resource's metadata (`none`,
// `unavailable`, `too_large`…) or known only at runtime (the wrapper's own
// `network`, `cors`, `load_failed`, etc.).
export type PreviewErrorType
  = | 'cors'
    | 'network'
    | 'unavailable'
    | 'too_large'
    | 'too_large_unsized'
    | 'malformed'
    | 'unknown'
    | 'load_failed'
    | 'map_load'
    | 'map_generation'
    | 'none'

type PreviewErrorInfo = {
  type: PreviewErrorType
  message: string
  userCta?: string
  producerCta?: string
}

/**
 * Determine the type of preview error based on resource metadata
 */
export function getPreviewErrorType(resource: Resource): PreviewErrorType {
  const extras = resource.extras

  // A diagnosed availability failure (the robot's check could not reach the
  // file) is the actual cause: like the runtime wrapper (PreviewWrapper), it
  // wins over the size/status heuristics, which would blame the file for
  // not loading.
  if (extras['check:available'] === false) {
    return 'unavailable'
  }

  // Note: there's no CORS branch here on purpose. A blocked origin is only
  // relevant for the fetch-based previews (pdf/json/xml), which detect and
  // diagnose it at runtime in PreviewWrapper (`getResourceCorsStatus`).

  // Check for file too large for tabular formats
  if (extras['analysis:error'] === 'File too large to download' && isTabularPipelineFormat(resource.format)) {
    return 'too_large'
  }

  // Check for tabular parsing errors (malformed).
  if (hasTabularParsingError(resource)) {
    return 'malformed'
  }

  // Check for general analysis errors
  if (extras['analysis:error']) {
    return 'unknown'
  }

  return 'none'
}

/**
 * The single source of every preview error text and CTA. Callers never build
 * their own sentences: they pass an error type (explicit when they know the cause
 * better than the metadata does) and receive message + CTAs.
 */
export function getPreviewErrorInfoByType(errorType: PreviewErrorType, resource?: Resource, fileType?: string): PreviewErrorInfo {
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
    case 'too_large_unsized':
      return {
        type: errorType,
        message: errorType === 'too_large_unsized'
          ? t('La taille du fichier est inconnue. Il est possible que le fichier soit trop volumineux pour être prévisualisé.')
          : fileType
            ? t('Ce fichier {fileType} est trop volumineux pour être prévisualisé.', { fileType })
            : t('Ce fichier est trop volumineux pour être prévisualisé.'),
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

    // A runtime failure with no clear CTA
    case 'load_failed':
      return {
        type: 'load_failed',
        message: t('L\'aperçu de ce fichier n\'a pas pu être chargé.'),
        userCta: '',
        producerCta: '',
      }

    case 'map_load':
      return {
        type: 'map_load',
        message: t('L\'aperçu cartographique de ce fichier n\'a pas pu être chargé.'),
        userCta: t('Signaler un problème avec cet aperçu'),
        producerCta: t('Signaler un problème'),
      }

    case 'map_generation':
      return {
        type: 'map_generation',
        message: t('La carte n\'a pas pu être générée automatiquement pour ce fichier.'),
        userCta: '',
        producerCta: '',
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
export function getPreviewErrorInfo(resource: Resource, fileType?: string): PreviewErrorInfo {
  return getPreviewErrorInfoByType(getPreviewErrorType(resource), resource, fileType)
}

/**
 * The error type to pass as `errorType` to `PreviewError` when a runtime
 * failure occurred but the metadata alone gives no cause: describe a failure
 * rather than claiming the file can't be previewed.
 */
export function getTransientErrorType(resource: Resource): PreviewErrorType | undefined {
  return getPreviewErrorType(resource) === 'none' ? 'load_failed' : undefined
}

/**
 * Check if a resource has any preview error
 */
export function hasPreviewError(resource: Resource): boolean {
  return getPreviewErrorType(resource) !== 'none'
}
