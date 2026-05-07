import type { MaybeRefOrGetter, Ref } from 'vue'
import type { HarvesterJob, HarvesterJobPreview, HarvestItem, HarvestItemStatus } from '~/types/harvesters'
import type { PaginatedArray } from '~/types/types'

// Real jobs expose items as a paginated subresource (server-side filter &
// pagination) and carry by_status / total counters on the link object.
// Previews are transient — not persisted — so items travel inline as an array,
// no fetch happens, and per-status counters would be misleading on such a
// small sample (capped server-side), hence `byStatus` stays null.
//
// This composable hides that divergence so JobPage consumes plain
// ComputedRef values and stays a pure view component.
function isPreviewJob(job: HarvesterJob | HarvesterJobPreview): job is HarvesterJobPreview {
  return Array.isArray(job.items)
}

export async function useJobItems(
  job: HarvesterJob | HarvesterJobPreview,
  inlineItems: MaybeRefOrGetter<Array<HarvestItem>>,
  page: Ref<number>,
  pageSize: Ref<number>,
  selectedStatus: Ref<{ id: HarvestItemStatus } | null>,
) {
  if (isPreviewJob(job)) {
    return {
      preview: true as const,
      displayedItems: computed(() => toValue(inlineItems)),
      displayedTotal: computed(() => toValue(inlineItems).length),
      total: computed(() => toValue(inlineItems).length),
      byStatus: null,
    }
  }

  const itemsUrl = computed(() => `/api/1/harvest/job/${job.id}/items/`)
  const itemsParams = computed(() => ({
    page: page.value,
    page_size: pageSize.value,
    ...(selectedStatus.value ? { status: selectedStatus.value.id } : {}),
  }))
  const { data: itemsPage } = await useAPI<PaginatedArray<HarvestItem>>(itemsUrl, { lazy: true, query: itemsParams })

  return {
    preview: false as const,
    displayedItems: computed(() => itemsPage.value?.data ?? []),
    displayedTotal: computed(() => itemsPage.value?.total ?? 0),
    total: computed(() => job.items.total),
    byStatus: computed(() => job.items.by_status),
  }
}
