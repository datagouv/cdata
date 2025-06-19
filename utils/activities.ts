import type { $Fetch } from 'nitropack'
import type { Activity } from '~/types/activity'
import type { PaginatedArray } from '~/types/types'

export function getActivityTranslation(activity: Activity) {
  const { t } = useI18n()
  return {
    'dataset:created': t('Création du jeu de données'),
    'dataset:updated': t('Mise à jour du jeu de données'),
    'dataset:deleted': t('Suppression du jeu de données'),
    'dataset:discussed': t('Discussion sur le jeu de données'),
    'dataset:followed': t('Nouveau favori sur le jeu de données'),
    'dataset:resource:added': t(`Ajout d'une ressource`),
    'dataset:resource:updated': t(`Mise à jour d'une ressource`),
    'dataset:resource:deleted': t(`Suppression d'une ressource`),
    'dataservice:created': t(`Création de l'API`),
    'dataservice:updated': t(`Mise à jour de l'API`),
    'dataservice:deleted': t(`Suppression de l'API`),
    'dataservice:discussed': t(`Discussion sur l'API`),
    'dataservice:followed': t(`Nouveau favori sur l'API`),
    'organization:created': t(`Création de l'organisation`),
    'organization:updated': t(`Mise à jour de l'organisation`),
    'organization:followed': t(`Nouveau favori sur l'organisation`),
    'reuse:created': t('Création de la réutilisation'),
    'reuse:updated': t('Mise à jour de la réutilisation'),
    'reuse:deleted': t('Suppression de la réutilisation'),
    'reuse:discussed': t('Discussion sur la réutilisation'),
    'reuse:followed': t('Nouveau favori sur la réutilisation'),
    'user:followed': t(`Nouveau favori sur l'utilisateur`),
    'topic:created': t('Création de la thématique'),
    'topic:updated': t('Mise à jour de la thématique'),
  }[activity.key] ?? activity.label
}

export async function getActitiesForObjects(api: $Fetch, auditables: Array<{ id: string }> | undefined, sort: '-created_at' | 'created_at' = '-created_at') {
  const activityPromises: Record<string, Promise<PaginatedArray<Activity>>> = {}
  if (!auditables) {
    return Promise.resolve({})
  }
  for (const auditable of auditables) {
    if (auditable.id in activityPromises) {
      continue
    }
    activityPromises[auditable.id] = api<PaginatedArray<Activity>>('/api/1/activity/', {
      params: {
        related_to: auditable.id,
        sort,
      },
    })
  }
  return (await Promise.allSettled(Object.values(activityPromises)))
    .filter(promise => promise.status === 'fulfilled')
    .map(promise => promise.value.data.pop())
    .reduce((activities, activity) => {
      if (activity) {
        activities[activity.related_to_id] = activity
      }
      return activities
    }, {} as Record<string, Activity>)
}
