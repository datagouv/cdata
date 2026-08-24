import { escapeCsvValue } from './helpers'
import { ofetch, type $Fetch } from 'ofetch'
import type { DatasetV2 } from '../types/datasets'
import type { PaginatedArray } from '../types/api'

export type OrganizationMetrics = {
  downloads: Record<string, number>
  downloadsTotal: number
  reusesViews: Record<string, number>
  reusesViewsTotal: number
  dataservicesViews: Record<string, number>
  dataservicesViewsTotal: number
  datasetsViews: Record<string, number>
  datasetsViewsTotal: number
}

export type DatasetMetrics = {
  visits: Record<string, number>
  visitsTotal: number
  downloads: Record<string, number>
  downloadsTotal: number
}

export type DataserviceMetrics = {
  visits: Record<string, number>
  visitsTotal: number
}

export type ReuseMetrics = {
  visits: Record<string, number>
  visitsTotal: number
}

type MonthlyVisitsRow = { metric_month: string, monthly_visit: number }
type MonthlyDatasetRow = MonthlyVisitsRow & { monthly_download_resource: number }
type MonthlyOrganizationRow = {
  metric_month: string
  monthly_download_resource: number
  monthly_visit_dataservice: number
  monthly_visit_dataset: number
  monthly_visit_reuse: number
}

type TotalVisitsRow = { visit: number }
type TotalDatasetRow = TotalVisitsRow & { download_resource: number }
type TotalOrganizationRow = {
  download_resource: number
  visit_dataservice: number
  visit_dataset: number
  visit_reuse: number
}

/**
 * The metrics API is a separate service, and the numbers it serves are secondary
 * to every page that displays them: an outage must leave the page readable. It
 * used to reject inside the callers' watchers instead, escaping as an unhandled
 * `TypeError: Failed to fetch` — the top client-side error on data.gouv.fr.
 *
 * Returning `null` puts the caller back on the "no metrics" state it already
 * renders while loading, for a failure at any of the three steps: the request
 * itself, an error status, or a body that isn't the expected page of rows.
 */
async function fetchMetrics<Row>(url: string): Promise<Array<Row> | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const page: { data?: Array<Row> } = await response.json()
    return Array.isArray(page?.data) ? page.data : null
  }
  catch {
    return null
  }
}

/**
 * There is only one metrics API endpoint to get these 3 values.
 * The rest of the metrics aren't stored yet at the organization level
 */
export async function getOrganizationMetrics(oid: string, metricsApi: string): Promise<OrganizationMetrics | null> {
  // Fetching last 12 months
  const rows = await fetchMetrics<MonthlyOrganizationRow>(`${metricsApi}/api/organizations/data/?organization_id__exact=${oid}&metric_month__sort=desc&page_size=12`)
  if (!rows) return null

  const dataservicesViews: Record<string, number> = {}
  const datasetsViews: Record<string, number> = {}
  const downloads: Record<string, number> = {}
  const reusesViews: Record<string, number> = {}

  for (const { metric_month, monthly_download_resource, monthly_visit_dataservice, monthly_visit_dataset, monthly_visit_reuse } of rows) {
    dataservicesViews[metric_month] = monthly_visit_dataservice
    datasetsViews[metric_month] = monthly_visit_dataset
    downloads[metric_month] = monthly_download_resource
    reusesViews[metric_month] = monthly_visit_reuse
  }
  // Fetching totals
  const total = (await fetchMetrics<TotalOrganizationRow>(`${metricsApi}/api/organizations_total/data/?organization_id__exact=${oid}`))?.[0]

  return {
    downloads,
    downloadsTotal: total?.download_resource ?? 0,
    reusesViews,
    reusesViewsTotal: total?.visit_reuse ?? 0,
    dataservicesViews,
    dataservicesViewsTotal: total?.visit_dataservice ?? 0,
    datasetsViews,
    datasetsViewsTotal: total?.visit_dataset ?? 0,
  }
}

export function createOrganizationMetricsUrl(datasetsViews: Record<string, number>, downloads: Record<string, number>, dataservicesViews: Record<string, number>, reusesViews: Record<string, number>) {
  let data = 'month,visit_datasets,download_resource,visit_dataservice,visit_reuse\n'

  for (const month in datasetsViews) {
    data += `${month},${datasetsViews[month]},${downloads[month]},${dataservicesViews[month]},${reusesViews[month]}\n`
  }

  return URL.createObjectURL(new Blob([data], { type: 'text/csv' }))
}

export async function getDatasetMetrics(datasetId: string, metricsApi: string): Promise<DatasetMetrics | null> {
  // Fetching last 12 months
  const rows = await fetchMetrics<MonthlyDatasetRow>(`${metricsApi}/api/datasets/data/?dataset_id__exact=${datasetId}&metric_month__sort=desc&page_size=12`)
  if (!rows) return null

  const visits: Record<string, number> = {}
  const downloads: Record<string, number> = {}

  for (const { metric_month, monthly_visit, monthly_download_resource } of rows) {
    visits[metric_month] = monthly_visit
    downloads[metric_month] = monthly_download_resource
  }

  // Fetching totals
  const total = (await fetchMetrics<TotalDatasetRow>(`${metricsApi}/api/datasets_total/data/?dataset_id__exact=${datasetId}`))?.[0]

  return {
    visits,
    visitsTotal: total?.visit ?? 0,
    downloads,
    downloadsTotal: total?.download_resource ?? 0,
  }
}

export async function createDatasetsForOrganizationMetricsUrl(organizationId: string, metricsApi: string, apiBase: string, apiFetch: $Fetch) {
  let data = 'dataset_title,dataset_id,month,monthly_visit,monthly_download_resource\n'

  // fetch datasets info from organization datasets through the configured fetch, so it carries the
  // consumer's auth (cookie for cdata via `$api`, Bearer for verticals) instead of a hardcoded
  // `credentials: 'include'`, which breaks CORS cross-origin on the verticals.
  const datasets: Record<string, Record<string, string>> = {}
  let datasetsUrl: string | null = `/api/2/datasets/?organization=${organizationId}&page_size=200`
  while (datasetsUrl) {
    const body: PaginatedArray<DatasetV2> = await apiFetch(datasetsUrl, { baseURL: apiBase })
    datasetsUrl = body.next_page
    for (const row of body.data) {
      datasets[row.id] = { title: row.title }
    }
  }

  // fetch datasets metrics for the organization
  let metricsUrl: string | null = `${metricsApi}/api/datasets/data/?organization_id__exact=${organizationId}&metric_month__sort=desc&page_size=50`
  while (metricsUrl) {
    const body: { links: { next: string | null }, data: Array<{ dataset_id: string, metric_month: string, monthly_visit: number, monthly_download_resource: number }> } = await ofetch(metricsUrl)
    metricsUrl = body.links.next
    for (const row of body.data) {
      const datasetTitle = datasets[row.dataset_id]?.title || ''
      data += `${escapeCsvValue(datasetTitle)},${escapeCsvValue(row.dataset_id)},${escapeCsvValue(row.metric_month)},${row.monthly_visit},${row.monthly_download_resource}\n`
    }
  }

  return URL.createObjectURL(new Blob([data], { type: 'text/csv' }))
}

export async function getDataserviceMetrics(dataserviceId: string, metricsApi: string): Promise<DataserviceMetrics | null> {
  // Fetching last 12 months
  const rows = await fetchMetrics<MonthlyVisitsRow>(`${metricsApi}/api/dataservices/data/?dataservice_id__exact=${dataserviceId}&metric_month__sort=desc&page_size=12`)
  if (!rows) return null

  const visits: Record<string, number> = {}

  for (const { metric_month, monthly_visit } of rows) {
    visits[metric_month] = monthly_visit
  }

  // Fetching totals
  const total = (await fetchMetrics<TotalVisitsRow>(`${metricsApi}/api/dataservices_total/data/?dataservice_id__exact=${dataserviceId}`))?.[0]

  return {
    visits,
    visitsTotal: total?.visit ?? 0,
  }
}

export async function getReuseMetrics(reuseId: string, metricsApi: string): Promise<ReuseMetrics | null> {
  // Fetching last 12 months
  const rows = await fetchMetrics<MonthlyVisitsRow>(`${metricsApi}/api/reuses/data/?reuse_id__exact=${reuseId}&metric_month__sort=desc&page_size=12`)
  if (!rows) return null

  const visits: Record<string, number> = {}

  for (const { metric_month, monthly_visit } of rows) {
    visits[metric_month] = monthly_visit
  }

  // Fetching totals
  const total = (await fetchMetrics<TotalVisitsRow>(`${metricsApi}/api/reuses_total/data/?reuse_id__exact=${reuseId}`))?.[0]

  return {
    visits,
    visitsTotal: total?.visit ?? 0,
  }
}
