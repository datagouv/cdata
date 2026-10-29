import type { Dataset, Dataservice, Organization, OrganizationReference, Reuse } from '@datagouv/components-next'

const page = '/design/cards#exemples'
const date = '2026-01-12T12:00:00+00:00'
const description = 'Des données ouvertes pour comprendre les territoires, comparer les usages et construire de nouveaux services. Cette description volontairement longue permet de vérifier la limitation à deux lignes et la lisibilité de la carte.'
const access = { access_type: 'open' as const, access_audiences: [], access_type_reason: null, access_type_reason_category: null, authorization_request_url: null }
const logo = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#ececfe"/><path d="M12 45 32 12l20 33H12Zm13-7h14l-7-12-7 12Z" fill="#000091"/></svg>')}`
const illustration = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#e3f2ed"/><path d="M0 60 640 240M80 0 500 360M0 280 640 80" stroke="white" stroke-width="28"/><path d="M80 280 220 180 390 230 540 80" fill="none" stroke="#000091" stroke-width="8"/><g fill="#000091"><circle cx="80" cy="280" r="14"/><circle cx="220" cy="180" r="14"/><circle cx="390" cy="230" r="14"/><circle cx="540" cy="80" r="14"/></g></svg>')}`

function organization(id: string, name: string, kind: string, certified: boolean, withLogo: boolean): Organization & OrganizationReference {
  return {
    class: 'Organization', id, name, acronym: null, slug: id, uri: '', page,
    logo: withLogo ? logo : '', logo_thumbnail: withLogo ? logo : '',
    badges: [{ kind }, ...(certified ? [{ kind: 'certified' }] : [])],
    permissions: { delete: false, edit: false, harvest: false, members: false, private: false },
    url: '', description, business_number_id: '', created_at: date, last_modified: date,
    deleted: null, extras: {}, members: [], banner_color: withLogo ? '#ececfe' : '#f6f6f6',
    metrics: { datasets: 1240, dataservices: 12, reuses: 37, followers: 2400, members: 8, views: 120000, datasets_by_months: {}, dataservices_by_months: {}, reuses_by_months: {} },
  }
}
export const exampleOrganizations = [
  { label: 'Service public certifié · logo et grands nombres', data: organization('demo-public', 'Observatoire des territoires', 'public-service', true, true) },
  { label: 'Collectivité · nom long et sans logo', data: organization('demo-local', 'Communauté de communes des vallées et des plateaux — service des données et de la transition écologique', 'local-authority', true, false) },
  { label: 'Association · description longue', data: organization('demo-association', 'Les données en partage', 'association', false, true) },
  { label: 'Entreprise · aucune publication', data: { ...organization('demo-company', 'Atelier des données', 'company', false, false), description: '', metrics: { ...organization('unused', '', 'company', false, false).metrics, datasets: 0, dataservices: 0, reuses: 0, followers: 0 } } },
]
const owner = { organization: exampleOrganizations[0]!.data, owner: null }
const quality = { score: 1, dataset_description_quality: true, resources_documentation: true, license: true, update_frequency: true, update_fulfilled_in_time: true, has_open_format: true, temporal_coverage: true, spatial: true, all_resources_available: true }
const dataset: Dataset = {
  ...owner, ...access, id: 'demo-dataset', title: 'Aménagements cyclables', acronym: '', archived: false,
  description, description_short: description, tags: [], license: 'lov2', frequency: 'monthly', temporal_coverage: null, frequency_date: null, page,
  private: false, spatial: null, contact_points: [], featured: false, badges: [], deleted: null, doi: null,
  resources: [], community_resources: [], created_at: date, last_modified: date, last_update: date,
  internal: { created_at_internal: date, last_modified_internal: date }, uri: '', slug: 'demo-dataset', quality,
  metrics: { dataservices: 3, discussions: 0, discussions_open: 0, followers: 120, resources_downloads: 42500, reuses: 18, views: 1250000 },
  harvest: null, extras: {}, permissions: { edit: false, edit_resources: false, delete: false },
}
export const exampleDatasets = [
  { label: 'Qualité complète · métriques élevées', data: dataset, organizationUrl: page },
  { label: 'Titre long · qualité incomplète', data: { ...dataset, id: 'demo-dataset-long', title: 'Inventaire des équipements et des services publics accessibles dans les communes et intercommunalités du territoire', quality: { ...quality, score: 0.33, resources_documentation: false, spatial: false, temporal_coverage: false, update_fulfilled_in_time: false }, organization: exampleOrganizations[1]!.data }, organizationUrl: page },
  { label: 'Brouillon · organisation non cliquable', data: { ...dataset, id: 'demo-dataset-draft', title: 'Budget participatif — édition 2026', private: true }, organizationUrl: null },
  { label: 'Archivé · sans description', data: { ...dataset, id: 'demo-dataset-archived', title: 'Archives des comptages routiers', archived: true, description: '', description_short: '', organization: exampleOrganizations[2]!.data }, organizationUrl: page },
]
const apiQuality: NonNullable<Dataservice['quality']> = { score: 1, has_description: true, has_machine_documentation: true, has_technical_documentation: true, has_business_documentation: true, license: true, has_contact_point: true, has_base_api_url: true, availability_documented: true, rate_limiting_documented: true, access_conditions_clear: true }
const dataservice: Dataservice = {
  ...owner, ...access, acronym: '', archived_at: null, availability: 99.9, base_api_url: null, contact_points: [], created_at: date, datasets: { href: '', rel: 'subsection', total: 2, type: 'GET' },
  deleted_at: null, description, featured: false, machine_documentation_url: null, technical_documentation_url: null, business_documentation_url: null, extras: {}, format: '', harvest: null,
  id: 'demo-api', license: 'lov2', metadata_modified_at: date, metrics: { discussions: 0, discussions_open: 0, followers: 42, reuses: 8, views: 24300 },
  permissions: { edit: false, delete: false }, private: false, rate_limiting: '', rate_limiting_url: null, self_api_url: '', self_web_url: page, slug: 'demo-api', tags: [], title: 'API des mobilités', quality: apiQuality,
}
export const exampleDataservices = [
  { label: 'Accès ouvert · qualité complète', data: dataservice },
  { label: 'Avec un compte · qualité incomplète', data: { ...dataservice, id: 'demo-api-account', title: 'API des équipements accessibles et des services de proximité', access_type: 'open_with_account' as const, quality: { ...apiQuality, score: 0.4, has_machine_documentation: false, has_business_documentation: false, has_contact_point: false, availability_documented: false, rate_limiting_documented: false, access_conditions_clear: false } } },
  { label: 'Accès restreint · qualité indisponible', data: { ...dataservice, id: 'demo-api-restricted', title: 'API des demandes administratives', access_type: 'restricted' as const, quality: undefined, organization: exampleOrganizations[1]!.data } },
  { label: 'Brouillon · sans logo', data: { ...dataservice, id: 'demo-api-draft', title: 'API expérimentale', private: true, organization: exampleOrganizations[3]!.data } },
]
const reuse: Reuse = {
  ...owner, id: 'demo-reuse', title: 'Les mobilités en cartes', description, tags: [], datasets: [], dataservices: [], topic: 'transport_and_mobility', type: 'application', url: page,
  private: false, badges: [], created_at: date, archived: null, deleted: null, extras: {}, featured: false, image: illustration, image_thumbnail: illustration,
  last_modified: date, metrics: { datasets: 4, discussions: 0, discussions_open: 0, followers: 340, views: 98700 }, slug: 'demo-reuse', page, uri: '', permissions: { edit: false, delete: false },
}
export const exampleReuses = [
  { label: 'Illustration · titre court', data: reuse },
  { label: 'Sans image · titre long', data: { ...reuse, id: 'demo-reuse-long', title: 'Comprendre les déplacements quotidiens et comparer les alternatives à la voiture dans tous les territoires', image: null, organization: exampleOrganizations[2]!.data } },
  { label: 'Archivé · visualisation', data: { ...reuse, id: 'demo-reuse-archived', title: 'Évolution des usages du vélo', archived: date, type: 'visualization' } },
]
