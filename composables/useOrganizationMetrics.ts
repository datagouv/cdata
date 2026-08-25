import { createOrganizationMetricsUrl, useMetrics, type Organization } from '@datagouv/components-next'
import type { MaybeRefOrGetter } from 'vue'

/**
 * Shared by the public organization page and the admin metrics page, which show the same
 * figures in their own layout.
 *
 * `server: false` keeps the call out of the render: the metrics API is a third-party service
 * and its numbers are secondary to both pages, so waiting for it would delay the whole page.
 * Callers hide their stat boxes on `error` rather than presenting a zero the API never
 * returned.
 */
export function useOrganizationMetrics(organization: MaybeRefOrGetter<Organization | null | undefined>) {
  const { getOrganizationMetrics } = useMetrics()

  const { data: metrics, error } = useAsyncData(
    'organization-metrics',
    () => {
      const id = toValue(organization)?.id
      return id ? getOrganizationMetrics(id) : Promise.resolve(null)
    },
    { lazy: true, server: false, watch: [() => toValue(organization)?.id] },
  )

  const downloadStatsUrl = computed(() => {
    if (!metrics.value) return null

    return createOrganizationMetricsUrl(metrics.value.datasetsViews, metrics.value.downloads, metrics.value.dataservicesViews, metrics.value.reusesViews)
  })

  return { metrics, error, downloadStatsUrl }
}
