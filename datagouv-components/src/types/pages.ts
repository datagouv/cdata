import type { DatasetV2 } from './datasets'
import type { Dataservice } from './dataservices'
import type { Reuse } from './reuses'

export type BlocWidth = '1/4' | '1/3' | '1/2' | '2/3' | '3/4' | '1'

// Blocs inside a section or an accordion item sit side by side, wrapping to a new row when
// the row is full. `null`: the whole row.
type Sized = { width: BlocWidth | null }

export type TitleBloc = Sized & {
  class: 'TitleBloc'
  id: string
  title: string
  subtitle: string | null
}

export type MarkdownBloc = Sized & {
  class: 'MarkdownBloc'
  id: string
  content: string
}

export type LinkInBloc = {
  title: string
  url: string
  color: string | null
}

export type LinksListBloc = Sized & {
  class: 'LinksListBloc'
  id: string
  paragraph: string | null
  main_link_title: string | null
  main_link_url: string | null
  links: Array<LinkInBloc>
}

export type ExploreBloc = Sized & {
  class: 'ExploreBloc'
  id: string
  resource_id: string
}

export type DatasetBloc = Sized & {
  class: 'DatasetBloc'
  id: string
  dataset: DatasetV2
}

export type DataserviceBloc = Sized & {
  class: 'DataserviceBloc'
  id: string
  dataservice: Dataservice
}

export type ReuseBloc = Sized & {
  class: 'ReuseBloc'
  id: string
  reuse: Reuse
}

export type ObjectBloc = DatasetBloc | DataserviceBloc | ReuseBloc

export type LeafBloc = TitleBloc | MarkdownBloc | LinksListBloc | ExploreBloc | ObjectBloc

export type AccordionContentBloc = Exclude<LeafBloc, ExploreBloc>

export type AccordionItemBloc = {
  title: string
  content: Array<AccordionContentBloc>
}

export type AccordionListBloc = Sized & {
  class: 'AccordionListBloc'
  id: string
  items: Array<AccordionItemBloc>
}

export type SectionContentBloc = AccordionListBloc | LeafBloc

export type SectionBloc = {
  class: 'SectionBloc'
  id: string
  blocs: Array<SectionContentBloc>
}

export type HeroBloc = {
  class: 'HeroBloc'
  id: string
  title: string
  description: string | null
  color: 'primary' | 'green' | 'purple'
  main_link_title: string | null
  main_link_url: string | null
}

export type PageBloc = HeroBloc | SectionBloc
