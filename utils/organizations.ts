/**
 * There is only one metrics API endpoint to get these 3 values.
 * The rest of the metrics aren't stored yet at the organization level
 */
export async function getOrganizationMetrics(oid: string) {
  const config = useRuntimeConfig()

  // Fetching last 12 months
  const response = await fetch(`${config.public.metricsApi}/api/organizations/data/?organization_id__exact=${oid}&metric_month__sort=desc&page_size=12`)
  const page = await response.json()

  const datasetsViews: Record<string, number> = {}
  const downloads: Record<string, number> = {}
  const reusesViews: Record<string, number> = {}

  for (const { metric_month, monthly_download_resource, monthly_visit_dataset, monthly_visit_reuse } of page.data) {
    datasetsViews[metric_month] = monthly_visit_dataset
    downloads[metric_month] = monthly_download_resource
    reusesViews[metric_month] = monthly_visit_reuse
  }
  // Fetching totals
  const totalResponse = await fetch(`${config.public.metricsApi}/api/organizations_total/data/?organization_id__exact=${oid}`)
  const totalPage = await totalResponse.json()

  let datasetsViewsTotal = 0
  let downloadsTotal = 0
  let reusesViewsTotal = 0
  if (page.data[0]) {
    datasetsViewsTotal = totalPage.data[0].visit_dataset
    downloadsTotal = totalPage.data[0].download_resource
    reusesViewsTotal = totalPage.data[0].visit_reuse
  }
  return {
    downloads,
    downloadsTotal,
    reusesViews,
    reusesViewsTotal,
    datasetsViews,
    datasetsViewsTotal,
  }
}

export function createOrganizationMetricsUrl(datasetsViews: Record<string, number>, downloads: Record<string, number>, reusesViews: Record<string, number>) {
  let data = 'month,visit_datasets,download_resource,visit_reuse\n'

  for (const month in datasetsViews) {
    data += `${month},${datasetsViews[month]},${downloads[month]},${reusesViews[month]}\n`
  }

  return URL.createObjectURL(new Blob([data], { type: 'text/csv' }))
}

export function cleanSiret(siret: string | null | undefined): string | null {
  if (!siret) return null
  return siret.replace(/\s+/g, '')
}
