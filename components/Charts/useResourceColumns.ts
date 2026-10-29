import type { ColumnDefinition, useGetProfile } from '@datagouv/components-next'
import { ref } from 'vue'
import { buildColumnsFromProfile } from '@datagouv/components-next'

export function useResourceColumns(getProfile: ReturnType<typeof useGetProfile>) {
  const resourceColumns = ref<Array<ColumnDefinition>>([])
  const resourceColumnsId = ref('')

  async function loadColumnsForResource(resourceId: string) {
    if (resourceColumnsId.value === resourceId) return
    resourceColumnsId.value = resourceId
    try {
      const profile = await getProfile(resourceId)
      if (resourceColumnsId.value !== resourceId) return
      resourceColumns.value = buildColumnsFromProfile(profile)
    }
    catch (error) {
      if (resourceColumnsId.value !== resourceId) return
      // A failed request must not mark the resource as loaded: the guard above
      // would swallow a retry of the same resource.
      resourceColumnsId.value = ''
      resourceColumns.value = []
      console.error(`Failed to load columns for resource ${resourceId}:`, error)
    }
  }

  return { resourceColumns, loadColumnsForResource }
}
