export type Site = {
  id: string
  title: string
  metrics: {
    'dataservices': number
    'datasets': number
    'datasets_visits_by_months': Record<string, number>
    'discussions': number
    'followers': number
    'harvesters': number
    'max_dataset_followers': number
    'max_dataset_reuses': number
    'max_org_datasets': number
    'max_org_followers': number
    'max_org_reuses': number
    'max_reuse_datasets': number
    'max_reuse_followers': number
    'organizations': number
    'public-service': number
    'resources': number
    'resources_downloads_by_months': Record<string, number>
    'reuses': number
    'users': number
    'users_by_months': Record<string, number>
    'datasets_by_months': Record<string, number>
    'harvesters_by_months': Record<string, number>
    'reuses_by_months': Record<string, number>
    'organizations_by_months': Record<string, number>
    'discussions_by_months': Record<string, number>
  }
}
