import { getResourceCorsStatus } from './resources'
import type { Resource } from '../types/resources'

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
  isProducerFault: boolean
}

/**
 * Determine the type of preview error based on resource metadata
 */
function getPreviewErrorType(resource: Resource): PreviewErrorType {
  const extras = resource.extras

  // Check for CORS issues first
  if (getResourceCorsStatus(resource) === 'blocked') {
    return 'cors'
  }

  // Check for file too large
  if (extras['analysis:error'] === 'File too large to download') {
    return 'too_large'
  }

  // Check for file unavailability
  if (extras['check:available'] === false) {
    return 'unavailable'
  }

  // Check for network errors (HTTP status >= 400)
  const checkStatus = extras['check:status']
  if (typeof checkStatus === 'number' && checkStatus >= 400) {
    return 'network'
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
 * Get error information for preview failures
 */
export function getPreviewErrorInfo(resource: Resource): PreviewErrorInfo {
  const errorType = getPreviewErrorType(resource)

  switch (errorType) {
    case 'cors':
      return {
        type: 'cors',
        message: 'Ce fichier est hébergé sur un site externe qui n’autorise pas son affichage dans data.gouv.fr.',
        userCta: '',
        producerCta: 'Contactez-nous si ça vous semble être une erreur',
        isProducerFault: true,
      }

    case 'network':
      return {
        type: 'network',
        message: 'Ce fichier hébergé sur un site externe n’a pas pu être chargé.',
        userCta: 'Faites le savoir au producteur',
        producerCta: 'Contactez-nous si ça vous semble être une erreur',
        isProducerFault: true,
      }

    case 'unavailable':
      return {
        type: 'unavailable',
        message: 'Ce fichier est hébergé sur un site externe et n’est pas disponible',
        userCta: 'Faites le savoir au producteur',
        producerCta: 'Contactez-nous',
        isProducerFault: true,
      }

    case 'too_large':
      return {
        type: 'too_large',
        message: 'Ce fichier est trop volumineux pour être prévisualisé.',
        userCta: 'Cette prévisualisation vous serait utile ?',
        producerCta: 'Cette prévisualisation vous serait utile ?',
        isProducerFault: false,
      }

    case 'malformed':
      return {
        type: 'malformed',
        message: 'La structure de ce fichier ne permet pas d\'afficher son aperçu',
        userCta: '',
        producerCta: 'Contactez-nous pour réparer',
        isProducerFault: true,
      }

    case 'none':
      return {
        type: 'none',
        message: 'Ce fichier ne peut pas être prévisualisé.',
        userCta: '',
        producerCta: '',
        isProducerFault: false,
      }

    case 'unknown':
    default:
      return {
        type: 'unknown',
        message: 'Une erreur a empêché le chargement de l\'aperçu de ce fichier.',
        userCta: 'Faites le savoir au producteur',
        producerCta: 'Contactez-nous pour réparer',
        isProducerFault: false,
      }
  }
}

/**
 * Check if a resource has any preview error
 */
export function hasPreviewError(resource: Resource): boolean {
  return getPreviewErrorType(resource) !== 'none'
}
