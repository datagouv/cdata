<template>
  <div class="space-y-5">
    <ResourceExplorer
      v-if="useNewExplorer"
      :dataset
      no-results-image="/illustrations/dataset.svg"
    />
    <DatasetsLegacyResourceList
      v-else
      :dataset
    />

    <RecommendationsDatasets :dataset />
  </div>
</template>

<script setup lang="ts">
import { ResourceExplorer, type DatasetV2 } from '@datagouv/components-next'

defineProps<{ dataset: DatasetV2 }>()

const route = useRoute()

// Feature flag: ?new_explorer=1 to enable, ?new_explorer=0 to disable, persisted in cookie
const newExplorerCookie = useCookie('new_explorer', { maxAge: 60 * 60 * 24 * 7, path: '/' })
const queryFlag = route.query.new_explorer as string | undefined
if (queryFlag === '1') {
  newExplorerCookie.value = '1'
}
else if (queryFlag === '0') {
  newExplorerCookie.value = null
}
// useCookie uses `destr` which deserializes '1' as the number 1
const useNewExplorer = computed(() => String(newExplorerCookie.value) === '1')

// A resource selected via ?resource_id duplicates content from the main dataset page,
// so it must stay out of the search index. Kept at the page level (not in a child
// component) so it applies whichever explorer renders the resources.
const hasResourceId = computed(() => 'resource_id' in route.query && route.query.resource_id)
if (import.meta.server && hasResourceId.value) {
  useSeoMeta({
    robots: 'noindex',
  })
}
</script>
