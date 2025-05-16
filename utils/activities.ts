import type { $Fetch } from 'nitropack'
import type { Dataset, DatasetV2 } from '~/datagouv-components/src/main'
import type { Activity } from '~/types/activity'
import type { PaginatedArray } from '~/types/types'

export function getActivityTranslation(activity: Activity) {
  const { t } = useI18n()
  return {
    'dataset:created': t('Dataset creation'),
    'dataset:updated': t('Dataset update'),
    'dataset:deleted': t('Dataset deletion'),
    'dataset:discussed': t('Dataset discussion'),
    'dataset:followed': t('Dataset follow'),
    'organization:created': t('Organization creation'),
    'organization:updated': t('Organization update'),
    'organization:followed': t('Organization follow'),
    'reuse:created': t('Reuse creation'),
    'reuse:updated': t('Reuse update'),
    'reuse:deleted': t('Reuse deletion'),
    'reuse:discussed': t('Reuse discussion'),
    'reuse:followed': t('Reuse follow'),
    'user:followed': t('User follow'),
  }[activity.key] ?? activity.label
}

export async function getActitiesForDatasets(api: $Fetch, datasets: Array<Dataset | DatasetV2>) {
  const activityPromises: Record<DatasetV2['id'], Promise<PaginatedArray<Activity>>> = {}
  for (const dataset of datasets) {
    if (dataset.id in activityPromises) {
      continue
    }
    activityPromises[dataset.id] = api<PaginatedArray<Activity>>('/api/1/activity/', {
      params: {
        related_to: dataset.id,
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
    }, {} as Record<Dataset['id'], Activity>)
}
