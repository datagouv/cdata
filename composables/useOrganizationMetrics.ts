import { createOrganizationMetricsUrl, useMetrics, type Organization, type OrganizationMetrics } from '@datagouv/components-next'
import type { MaybeRefOrGetter } from 'vue'

/**
 * Shared by the public organization page and the admin metrics page, which show the same
 * figures in their own layout.
 *
 * `metrics` carries three states, because the two failure-free ones are not enough: it is
 * `undefined` while the request is in flight, and `null` when the metrics API failed
 * (`getOrganizationMetrics` answers `null` rather than rejecting). Callers show the loading
 * boxes for the former and hide them for the latter, instead of presenting a zero the API
 * never returned.
 */
export function useOrganizationMetrics(organization: MaybeRefOrGetter<Organization | null | undefined>) {
  const { getOrganizationMetrics } = useMetrics()

  const metrics = ref<OrganizationMetrics | null>()

  watchEffect(async () => {
    // The render doesn't await this watcher, so the answer never reaches the SSR output:
    // requesting it from the server only adds a call whose result is thrown away.
    if (import.meta.server) return

    const id = toValue(organization)?.id
    if (!id) return

    metrics.value = await getOrganizationMetrics(id)
  })

  const failed = computed(() => metrics.value === null)

  const downloadStatsUrl = computed(() => {
    if (!metrics.value) return null

    return createOrganizationMetricsUrl(metrics.value.datasetsViews, metrics.value.downloads, metrics.value.dataservicesViews, metrics.value.reusesViews)
  })

  return { metrics, failed, downloadStatsUrl }
}
