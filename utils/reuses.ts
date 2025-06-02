import type { Dataset, DatasetV2, Reuse, ReuseTopic, ReuseType } from '@datagouv/components-next'
import type { DatasetSuggest, NewReuseForApi, ReuseForm } from '~/types/types'

export const reusesXFields = 'data{archived,deleted,featured,id,owner,organization,metrics,created_at,last_modified,title,slug,page,description,type,url,image,image_thumbnail},page,page_size,total'

export function getReuseAdminUrl(reuse: Reuse): string {
  return `/admin/reuses/${reuse.id}`
}

export function reuseToForm(reuse: Reuse, types: Array<ReuseType>, topics: Array<ReuseTopic>): ReuseForm {
  return {
    owned: reuse.organization ? { organization: reuse.organization, owner: null } : { owner: reuse.owner, organization: null },
    title: reuse.title,
    description: reuse.description,
    url: reuse.url,
    type: { id: reuse.type, label: types.find(t => t.id === reuse.type)?.label || reuse.type },
    topic: { id: reuse.topic, label: topics.find(t => t.id === reuse.topic)?.label || reuse.topic },
    tags: reuse.tags?.map(text => ({ text })) || [],
    image: reuse.image,
    private: reuse.private,
    featured: reuse.featured,
  }
}

export function toApi(form: ReuseForm, overrides: { datasets?: Array<Dataset | DatasetV2 | DatasetSuggest>, private?: boolean } = {}): NewReuseForApi {
  return {
    organization: form.owned?.organization?.id,
    owner: form.owned?.owner?.id,
    title: form.title,
    url: form.url,
    private: overrides.private,
    description: form.description,
    datasets: overrides.datasets ? overrides.datasets.map(({ id }) => id) : undefined,
    type: form.type?.id || '',
    topic: form.topic?.id || '',
    tags: form.tags.map(t => t.text),
  }
}

export async function getReuseMetrics(rid: string) {
  // Fetching last 12 months
  const response = await fetch(`https://metric-api.data.gouv.fr/api/reuses/data/?reuse_id__exact=${rid}&metric_month__sort=desc&page_size=12`)
  const page = await response.json()

  const reuseViews: Record<string, number> = {}

  for (const { metric_month, monthly_visit } of page.data) {
    reuseViews[metric_month] = monthly_visit
  }
  // Fetching totals
  const totalResponse = await fetch(`https://metric-api.data.gouv.fr/api/reuses_total/data/?reuse_id__exact=${rid}`)
  const totalPage = await totalResponse.json()

  let reuseViewsTotal = 0
  if (page.data[0]) {
    reuseViewsTotal = totalPage.data[0].visit
  }
  return {
    reuseViews,
    reuseViewsTotal,
  }
}

export function createReuseMetricsUrl(reuseViews: Record<string, number>) {
  let data = 'month,visit\n'

  for (const month in reuseViews) {
    data += `${month},${reuseViews[month]}\n`
  }

  return URL.createObjectURL(new Blob([data], { type: 'text/csv' }))
}
