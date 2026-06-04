# Design: "Réutilisations" tab for dataservice pages

## Goal

Datasets have a "Réutilisations et API" tab listing the reuses (and APIs) that
use the dataset. Add an equivalent tab to dataservice (API) pages so users can
see which reuses use a given dataservice.

A dataservice *is* an API, so unlike datasets there is no nested APIs list — the
tab shows reuses only. The tab is labelled **"Réutilisations"**.

## Context

- Stack: Nuxt 4 / Vue 3, component library `@datagouv/components-next`.
- Dataservice page: `pages/dataservices/[did].vue` already uses `FullPageTabs`
  with a `<NuxtPage :dataservice />` outlet. Current tabs: Informations
  (`index.vue`), Discussions (`discussions.vue`), in `pages/dataservices/[did]/`.
- Reference implementation: the dataset reuses tab
  `pages/datasets/[did]/reuses_and_dataservices.vue`, which fetches
  `/api/1/reuses?dataset={id}` with the `reusesXFields` header and renders
  `ReuseCard` + `Pagination`, plus an empty state.
- `Dataservice.metrics.reuses` exists
  (`@datagouv/components-next` `types/dataservices.ts:63`), so the tab count is
  available client-side.

## Changes

### 1. New sub-page `pages/dataservices/[did]/reuses.vue`

Receives `dataservice` as a prop (matching sibling sub-pages). Mirrors the reuses
half of the dataset tab:

```ts
const props = defineProps<{ dataservice: Dataservice }>()

useSeoMeta({ robots: 'noindex' })

const reusesPage = ref(1)
const reusesQuery = computed(() => ({
  dataservice: props.dataservice.id,
  page: reusesPage.value,
  page_size: 6,
}))
const { data: reuses } = await useAPI<PaginatedArray<Reuse>>('/api/1/reuses', {
  query: reusesQuery,
  headers: { 'X-Fields': reusesXFields },
})
```

Template (copied from the reuses portion of
`datasets/[did]/reuses_and_dataservices.vue`, unchanged):

- **Populated state** (`reuses.total > 0`): `{n} réutilisations | {n} réutilisation | {n} réutilisations`
  header, `grid sm:grid-cols-3` of `ReuseCard` (`:reuse-url="reuse.page"`),
  and `Pagination` wired to `reusesPage`.
- **Empty state** (`reuses.total === 0`): `reuse.svg` illustration,
  "Il n'y a pas encore de réutilisations associées", and a `BrandedButton`
  (color primary) linking to `/admin/reuses/new` labelled "Ajouter une réutilisation".

### 2. Add the tab in `pages/dataservices/[did].vue`

Insert into the `FullPageTabs` `:links` array (before Discussions, mirroring the
datasets ordering where reuses precede discussions):

```ts
{
  label: $t('Réutilisations'),
  href: `/dataservices/${route.params.did}/reuses`,
  count: dataservice.metrics.reuses ?? 0,
},
```

## Explicitly not included (present in the dataset tab, N/A here)

- The APIs / `DataserviceCard` section — a dataservice is itself the API.
- `<RecommendationsReuses :dataset />` — dataset-specific recommender.

## Feasibility note

The `/api/1/reuses?dataservice={id}` filter must be confirmed during
implementation. Strong supporting evidence it works: the reverse filter
`/api/1/dataservices?reuse={id}` is already used in the codebase
(`pages/reuses/[rid]/index.vue`), and `Dataservice.metrics.reuses` exists. If the
filter is unsupported, fall back to whatever the backend exposes for the
dataservice→reuses relationship before considering the work complete.

## Testing

- Tab renders with the correct `metrics.reuses` count badge.
- For a dataservice with reuses: reuses are listed, pagination works.
- For a dataservice with no reuses: empty state (illustration + add-reuse button)
  is shown.
