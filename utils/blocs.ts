import type { InjectionKey } from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'
import { v5 as uuidv5 } from 'uuid'
import type { BrandedButton, Dataservice, DatasetV2, Reuse } from '@datagouv/components-next'
import type { AccordionContentBloc, LeafBloc, LinkInBloc, PageBloc, ObjectBloc, SectionContentBloc } from '~/types/pages'

// Colour of the main buttons of the page (e.g. green on /reuses), provided by `EditoBlocs`
// to the blocs however deep they are nested.
export const BLOCS_MAIN_COLOR: InjectionKey<ComponentProps<typeof BrandedButton>['color']> = Symbol('blocsMainColor')

// Reads the bloc format served before the udata migration to sections (titles inside
// each bloc, `*ListBloc`s). Mirrors that migration; remove once it has run everywhere.

type LegacyTitle = { title?: string | null, subtitle?: string | null }

type LegacyDatasetsListBloc = { class: 'DatasetsListBloc', id: string, datasets: Array<DatasetV2> } & LegacyTitle
type LegacyDataservicesListBloc = { class: 'DataservicesListBloc', id: string, dataservices: Array<Dataservice> } & LegacyTitle
type LegacyReusesListBloc = { class: 'ReusesListBloc', id: string, reuses: Array<Reuse> } & LegacyTitle
type LegacyMarkdownBloc = { class: 'MarkdownBloc', id: string, content: string } & LegacyTitle
type LegacyLinksListBloc = {
  class: 'LinksListBloc'
  id: string
  paragraph: string | null
  main_link_title: string | null
  main_link_url: string | null
  links: Array<LinkInBloc>
} & LegacyTitle
type LegacyExploreBloc = { class: 'ExploreBloc', id: string, resource_id: string } & LegacyTitle
type LegacyAccordionListBloc = {
  class: 'AccordionListBloc'
  id: string
  title?: string | null
  description?: string | null
  items: Array<{ title: string, content: Array<LegacyContentBloc> }>
}

type LegacyContentBloc = LegacyDatasetsListBloc | LegacyDataservicesListBloc | LegacyReusesListBloc | LegacyMarkdownBloc | LegacyLinksListBloc | LegacyExploreBloc

export type LegacyBloc = LegacyContentBloc | LegacyAccordionListBloc

// Ids of the containers built here derive from the source bloc id, so the server and the
// client render the same ids (no hydration mismatch) and they stay valid UUIDs.
const LEGACY_BLOCS_NAMESPACE = '6f1d3c2e-6a43-4d1b-9b0e-2f6f8f4b8a11'

function derivedId(sourceId: string, suffix: string): string {
  return uuidv5(`${sourceId}:${suffix}`, LEGACY_BLOCS_NAMESPACE)
}

function isFilled(value: string | null | undefined): value is string {
  return !!value && !!value.trim()
}

function titleBlocs(sourceId: string, title: string | null | undefined, subtitle: string | null | undefined): Array<LeafBloc> {
  if (isFilled(title)) {
    return [{ class: 'TitleBloc', id: derivedId(sourceId, 'title'), width: null, title, subtitle: isFilled(subtitle) ? subtitle : null }]
  }
  // A title is required on a TitleBloc: a lone subtitle stays as text.
  if (isFilled(subtitle)) {
    return [{ class: 'MarkdownBloc', id: derivedId(sourceId, 'title'), width: null, content: subtitle }]
  }
  return []
}

function convertLegacyBloc(bloc: LegacyBloc): Array<SectionContentBloc> {
  if (bloc.class === 'AccordionListBloc') {
    return [
      ...titleBlocs(bloc.id, bloc.title, bloc.description),
      {
        class: 'AccordionListBloc',
        id: bloc.id,
        width: null,
        items: bloc.items.map(item => ({
          title: item.title,
          content: item.content.flatMap(convertLegacyBloc) as Array<AccordionContentBloc>,
        })),
      },
    ]
  }

  const title = titleBlocs(bloc.id, bloc.title, bloc.subtitle)
  switch (bloc.class) {
    case 'DatasetsListBloc':
      return [...title, ...bloc.datasets.map((dataset, index): ObjectBloc => ({ class: 'DatasetBloc', id: derivedId(bloc.id, `object-${index}`), width: '1/2', dataset }))]
    case 'DataservicesListBloc':
      return [...title, ...bloc.dataservices.map((dataservice, index): ObjectBloc => ({ class: 'DataserviceBloc', id: derivedId(bloc.id, `object-${index}`), width: '1/2', dataservice }))]
    case 'ReusesListBloc':
      return [...title, ...bloc.reuses.map((reuse, index): ObjectBloc => ({ class: 'ReuseBloc', id: derivedId(bloc.id, `object-${index}`), width: '1/3', reuse }))]
    case 'MarkdownBloc':
      return [...title, { class: 'MarkdownBloc', id: bloc.id, width: null, content: bloc.content }]
    case 'LinksListBloc':
      return [...title, {
        class: 'LinksListBloc',
        id: bloc.id,
        width: null,
        paragraph: bloc.paragraph,
        main_link_title: bloc.main_link_title,
        main_link_url: bloc.main_link_url,
        links: bloc.links,
      }]
    case 'ExploreBloc':
      return [...title, { class: 'ExploreBloc', id: bloc.id, width: null, resource_id: bloc.resource_id }]
    default:
      // Kept untouched so that saving the page does not drop a bloc we cannot read.
      return [bloc as SectionContentBloc]
  }
}

export function normalizeBlocs(blocs: Array<PageBloc | LegacyBloc>): Array<PageBloc> {
  return blocs.map((bloc) => {
    if (bloc.class === 'HeroBloc' || bloc.class === 'SectionBloc') return bloc
    return { class: 'SectionBloc', id: derivedId(bloc.id, 'section'), blocs: convertLegacyBloc(bloc) }
  })
}
