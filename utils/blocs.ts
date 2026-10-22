import type { InjectionKey, Ref } from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'
import { v5 as uuidv5 } from 'uuid'
import type { BrandedButton, Dataservice, DatasetV2, Reuse } from '@datagouv/components-next'
import type { AccordionContentBloc, BlocWidth, ButtonBloc, LeafBloc, LinkInBloc, MarkdownBloc, PageBloc, ObjectBloc, SectionBloc, SectionColor, SectionContentBloc } from '~/types/pages'

// Colour of the main buttons of the page (e.g. green on /reuses), provided by `EditoBlocs`
// to the blocs however deep they are nested.
export const BLOCS_MAIN_COLOR: InjectionKey<ComponentProps<typeof BrandedButton>['color']> = Symbol('blocsMainColor')

// Background of the section holding a bloc, provided by `BlocsList`: on a colored one, the
// blocs are drawn in white.
export const SECTION_COLOR: InjectionKey<Ref<SectionColor | null>> = Symbol('sectionColor')

// The title bloc that is the title of the page (`h1`), provided by `EditoBlocs`: the first
// one, when the page has no title of its own.
export const PAGE_TITLE_ID: InjectionKey<Ref<string | null>> = Symbol('pageTitleId')

// Reads the bloc format served before the udata migration to sections (titles inside
// each bloc, `*ListBloc`s, heroes, links with a paragraph and a main link). Mirrors that
// migration; remove once it has run everywhere.

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
  items: Array<{ id?: string, title: string, content: Array<LegacyContentBloc> }>
}

type LegacyHeroBloc = {
  class: 'HeroBloc'
  id: string
  title: string
  description: string | null
  color: SectionColor | null
  main_link_title: string | null
  main_link_url: string | null
}

type LegacyContentBloc = LegacyDatasetsListBloc | LegacyDataservicesListBloc | LegacyReusesListBloc | LegacyMarkdownBloc | LegacyLinksListBloc | LegacyExploreBloc

export type LegacyBloc = LegacyContentBloc | LegacyAccordionListBloc | LegacyHeroBloc

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

// The button of a legacy main link, which was only shown with both a title and a URL.
function buttonBlocs(sourceId: string, title: string | null, url: string | null, width: BlocWidth | null): Array<ButtonBloc> {
  if (!isFilled(title) || !isFilled(url)) return []
  return [{ class: 'ButtonBloc', id: derivedId(sourceId, 'button'), width, title, url }]
}

function convertLegacyBloc(bloc: LegacyContentBloc | LegacyAccordionListBloc): Array<SectionContentBloc> {
  if (bloc.class === 'AccordionListBloc') {
    return [
      ...titleBlocs(bloc.id, bloc.title, bloc.description),
      {
        class: 'AccordionListBloc',
        id: bloc.id,
        width: null,
        // Items got their id with the migration
        items: bloc.items.map((item, index) => ({
          id: item.id ?? derivedId(bloc.id, `item-${index}`),
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
    case 'LinksListBloc': {
      // Split into a text, the links and a button, which keep their places: the paragraph on
      // the left of the links with the button under it, or the button under the links.
      const width = isFilled(bloc.paragraph) ? '1/2' : null
      const paragraph: Array<MarkdownBloc> = isFilled(bloc.paragraph)
        ? [{ class: 'MarkdownBloc', id: derivedId(bloc.id, 'paragraph'), width, content: bloc.paragraph }]
        : []
      return [
        ...title,
        ...paragraph,
        { class: 'LinksListBloc', id: bloc.id, width, links: bloc.links },
        ...buttonBlocs(bloc.id, bloc.main_link_title, bloc.main_link_url, width),
      ]
    }
    case 'ExploreBloc':
      return [...title, { class: 'ExploreBloc', id: bloc.id, width: null, resource_id: bloc.resource_id }]
    default:
      // Kept untouched so that saving the page does not drop a bloc we cannot read.
      return [bloc as SectionContentBloc]
  }
}

// A hero becomes a section of its color (the primary one without), holding its title and its
// button. Where sections have no color (an organization page), a neutral one.
function convertHero(hero: LegacyHeroBloc, colored: boolean): SectionBloc {
  return {
    class: 'SectionBloc',
    id: hero.id,
    color: colored ? hero.color ?? 'primary' : null,
    blocs: [
      { class: 'TitleBloc', id: derivedId(hero.id, 'title'), width: null, title: hero.title, subtitle: isFilled(hero.description) ? hero.description : null },
      ...buttonBlocs(hero.id, hero.main_link_title, hero.main_link_url, null),
    ],
  }
}

// A legacy bloc showing nothing (an empty list without a title) is dropped: a section is
// never empty.
export function normalizeBlocs(blocs: Array<PageBloc | LegacyBloc>, colored = true): Array<PageBloc> {
  return blocs.flatMap((bloc) => {
    if (bloc.class === 'SectionBloc') return [bloc]
    if (bloc.class === 'HeroBloc') return [convertHero(bloc, colored)]
    const content = convertLegacyBloc(bloc)
    return content.length ? [{ class: 'SectionBloc' as const, id: derivedId(bloc.id, 'section'), color: null, blocs: content }] : []
  })
}
