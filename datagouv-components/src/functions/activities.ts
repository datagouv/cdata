import { useTranslation } from '../composables/useTranslation'
import type { Activity } from '../types/activity'

export function getActivityTranslation(activity: Activity): string {
  const { t } = useTranslation()

  // Simple mapping of activity keys to human-readable text
  const translations: Record<string, string> = {
    'dataset:created': t('a créé le jeu de données'),
    'dataset:updated': t('a mis à jour le jeu de données'),
    'dataset:deleted': t('a supprimé le jeu de données'),
    'dataset:discussed': t('a discuté du jeu de données'),
    'dataset:followed': t('suit le jeu de données'),
    'dataset:resource:added': t('a ajouté une ressource'),
    'dataset:resource:updated': t('a mis à jour une ressource'),
    'dataset:resource:deleted': t('a supprimé une ressource'),
    'dataservice:created': t('a créé le service de données'),
    'dataservice:updated': t('a mis à jour le service de données'),
    'dataservice:deleted': t('a supprimé le service de données'),
    'dataservice:discussed': t('a discuté du service de données'),
    'dataservice:followed': t('suit le service de données'),
    'organization:created': t('a créé l\'organisation'),
    'organization:updated': t('a mis à jour l\'organisation'),
    'organization:followed': t('suit l\'organisation'),
    'reuse:created': t('a créé la réutilisation'),
    'reuse:updated': t('a mis à jour la réutilisation'),
    'reuse:deleted': t('a supprimé la réutilisation'),
    'reuse:discussed': t('a discuté de la réutilisation'),
    'reuse:followed': t('suit la réutilisation'),
    'user:followed': t('suit l\'utilisateur'),
    'topic:created': t('a créé le sujet'),
    'topic:updated': t('a mis à jour le sujet'),
  }

  return translations[activity.key] || activity.label || activity.key
}
