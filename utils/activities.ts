import type { Activity } from '@datagouv/components-next'
import type { ApiFetch, PaginatedArray } from '~/types/types'

export async function getLatestActivitiesForObjects(api: ApiFetch, auditables: Array<{ id: string }> | undefined, sort: '-created_at' | 'created_at' = '-created_at', page_size: number = 1): Promise<Record<string, Activity>> {
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
        page_size,
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
