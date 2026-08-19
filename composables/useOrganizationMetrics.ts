import { createOrganizationMetricsUrl, useMetrics, type Organization } from '@datagouv/components-next'
import type { MaybeRefOrGetter } from 'vue'

// The metrics API is a third party the pages using it can live without, so it stays out of the
// SSR render, and `useLazyAsyncData` exposes a failure (request blocked by a browser extension,
// flaky network, navigation cancelling the request) as `error` instead of letting it bubble up
// as an unhandled rejection. Shared by the public organization page and the admin metrics page,
// which display the same figures with their own layout.
export function useOrganizationMetrics(organization: MaybeRefOrGetter<Organization | null | undefined>) {
  const { getOrganizationMetrics } = useMetrics()

  const { data: metrics, error } = useLazyAsyncData(
    () => `organization-metrics-${toValue(organization)?.id}`,
    () => {
      const id = toValue(organization)?.id
      return id ? getOrganizationMetrics(id) : Promise.resolve(null)
    },
    { server: false },
  )

  const downloadStatsUrl = computed(() => {
    if (!metrics.value) return null

    return createOrganizationMetricsUrl(metrics.value.datasetsViews, metrics.value.downloads, metrics.value.dataservicesViews, metrics.value.reusesViews)
  })

  return { metrics, error, downloadStatsUrl }
}
