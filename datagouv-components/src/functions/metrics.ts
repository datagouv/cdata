import { escapeCsvValue } from './helpers'

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

/**
 * There is only one metrics API endpoint to get these 3 values.
 * The rest of the metrics aren't stored yet at the organization level
 */
export async function getOrganizationMetrics(oid: string, metricsApi: string): Promise<OrganizationMetrics> {
  // Fetching last 12 months
  const response = await fetch(`${metricsApi}/api/organizations/data/?organization_id__exact=${oid}&metric_month__sort=desc&page_size=12`)
  const page = await response.json()

  const dataservicesViews: Record<string, number> = {}
  const datasetsViews: Record<string, number> = {}
  const downloads: Record<string, number> = {}
  const reusesViews: Record<string, number> = {}

  for (const { metric_month, monthly_download_resource, monthly_visit_dataservice, monthly_visit_dataset, monthly_visit_reuse } of page.data) {
    dataservicesViews[metric_month] = monthly_visit_dataservice
    datasetsViews[metric_month] = monthly_visit_dataset
    downloads[metric_month] = monthly_download_resource
    reusesViews[metric_month] = monthly_visit_reuse
  }
  // Fetching totals
  const totalResponse = await fetch(`${metricsApi}/api/organizations_total/data/?organization_id__exact=${oid}`)
  const totalPage = await totalResponse.json()

  let dataservicesViewsTotal = 0
  let datasetsViewsTotal = 0
  let downloadsTotal = 0
  let reusesViewsTotal = 0
  if (page.data[0]) {
    dataservicesViewsTotal = totalPage.data[0].visit_dataservice
    datasetsViewsTotal = totalPage.data[0].visit_dataset
    downloadsTotal = totalPage.data[0].download_resource
    reusesViewsTotal = totalPage.data[0].visit_reuse
  }
  return {
    downloads,
    downloadsTotal,
    reusesViews,
    reusesViewsTotal,
    dataservicesViews,
    dataservicesViewsTotal,
    datasetsViews,
    datasetsViewsTotal,
  }
}

export function createOrganizationMetricsUrl(datasetsViews: Record<string, number>, downloads: Record<string, number>, dataservicesViews: Record<string, number>, reusesViews: Record<string, number>) {
  let data = 'month,visit_datasets,download_resource,visit_dataservice,visit_reuse\n'

  for (const month in datasetsViews) {
    data += `${month},${datasetsViews[month]},${downloads[month]},${dataservicesViews[month]},${reusesViews[month]}\n`
  }

  return URL.createObjectURL(new Blob([data], { type: 'text/csv' }))
}

export async function getDatasetMetrics(datasetId: string, metricsApi: string): Promise<DatasetMetrics> {
  // Fetching last 12 months
  const response = await fetch(`${metricsApi}/api/datasets/data/?dataset_id__exact=${datasetId}&metric_month__sort=desc&page_size=12`)
  const page = await response.json()

  const visits: Record<string, number> = {}
  const downloads: Record<string, number> = {}

  for (const { metric_month, monthly_visit, monthly_download_resource } of page.data) {
    visits[metric_month] = monthly_visit
    downloads[metric_month] = monthly_download_resource
  }

  // Fetching totals
  const totalResponse = await fetch(`${metricsApi}/api/datasets_total/data/?dataset_id__exact=${datasetId}`)
  const totalPage = await totalResponse.json()

  let visitsTotal = 0
  let downloadsTotal = 0
  if (totalPage.data[0]) {
    visitsTotal = totalPage.data[0].visit
    downloadsTotal = totalPage.data[0].download_resource
  }

  return {
    visits,
    visitsTotal,
    downloads,
    downloadsTotal,
  }
}

export async function createDatasetsForOrganizationMetricsUrl(organizationId: string, metricsApi: string, apiBase: string) {
  let data = 'dataset_title,dataset_id,month,monthly_visit,monthly_download_resource\n'

  // fetch datasets info from organization datasets
  const datasets: Record<string, Record<string, string>> = {}
  let datasets_url = `${apiBase}/api/2/datasets/?organization=${organizationId}&page_size=200`
  do {
    const response = await fetch(datasets_url)
    const body = await response.json()
    datasets_url = body.next_page
    for (const row of body.data) {
      datasets[row.id] = { title: row.title }
    }
  } while (datasets_url)

  // fetch datasets metrics for the organization
  let metrics_url = `${metricsApi}/api/datasets/data/?organization_id__exact=${organizationId}&metric_month__sort=desc&page_size=50`
  do {
    const response = await fetch(metrics_url)
    const body = await response.json()
    metrics_url = body.links.next
    for (const row of body.data) {
      const datasetTitle = datasets[row.dataset_id]?.title || ''
      data += `${escapeCsvValue(datasetTitle)},${escapeCsvValue(row.dataset_id)},${escapeCsvValue(row.metric_month)},${row.monthly_visit},${row.monthly_download_resource}\n`
    }
  } while (metrics_url)

  return URL.createObjectURL(new Blob([data], { type: 'text/csv' }))
}

export async function getDataserviceMetrics(dataserviceId: string, metricsApi: string): Promise<DataserviceMetrics> {
  // Fetching last 12 months
  const response = await fetch(`${metricsApi}/api/dataservices/data/?dataservice_id__exact=${dataserviceId}&metric_month__sort=desc&page_size=12`)
  const page = await response.json()

  const visits: Record<string, number> = {}

  for (const { metric_month, monthly_visit } of page.data) {
    visits[metric_month] = monthly_visit
  }

  // Fetching totals
  const totalResponse = await fetch(`${metricsApi}/api/dataservices_total/data/?dataservice_id__exact=${dataserviceId}`)
  const totalPage = await totalResponse.json()

  let visitsTotal = 0
  if (totalPage.data[0]) {
    visitsTotal = totalPage.data[0].visit
  }

  return {
    visits,
    visitsTotal,
  }
}

export async function getReuseMetrics(reuseId: string, metricsApi: string): Promise<ReuseMetrics> {
  // Fetching last 12 months
  const response = await fetch(`${metricsApi}/api/reuses/data/?reuse_id__exact=${reuseId}&metric_month__sort=desc&page_size=12`)
  const page = await response.json()

  const visits: Record<string, number> = {}

  for (const { metric_month, monthly_visit } of page.data) {
    visits[metric_month] = monthly_visit
  }

  // Fetching totals
  const totalResponse = await fetch(`${metricsApi}/api/reuses_total/data/?reuse_id__exact=${reuseId}`)
  const totalPage = await totalResponse.json()

  let visitsTotal = 0
  if (totalPage.data[0]) {
    visitsTotal = totalPage.data[0].visit
  }

  return {
    visits,
    visitsTotal,
  }
}
