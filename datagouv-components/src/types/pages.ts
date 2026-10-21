import type { DatasetV2 } from './datasets'
import type { Dataservice } from './dataservices'
import type { Reuse } from './reuses'

export type TitleBloc = {
  class: 'TitleBloc'
  id: string
  title: string
  subtitle: string | null
}

export type MarkdownBloc = {
  class: 'MarkdownBloc'
  id: string
  content: string
}

export type LinkInBloc = {
  title: string
  url: string
  color: string | null
}

export type LinksListBloc = {
  class: 'LinksListBloc'
  id: string
  paragraph: string | null
  main_link_title: string | null
  main_link_url: string | null
  links: Array<LinkInBloc>
}

export type ExploreBloc = {
  class: 'ExploreBloc'
  id: string
  resource_id: string
}

export type DatasetBloc = {
  class: 'DatasetBloc'
  id: string
  dataset: DatasetV2
}

export type DataserviceBloc = {
  class: 'DataserviceBloc'
  id: string
  dataservice: Dataservice
}

export type ReuseBloc = {
  class: 'ReuseBloc'
  id: string
  reuse: Reuse
}

export type ObjectBloc = DatasetBloc | DataserviceBloc | ReuseBloc

export type LeafBloc = TitleBloc | MarkdownBloc | LinksListBloc | ExploreBloc | ObjectBloc

export type GridCellWidth = '1/4' | '1/3' | '1/2' | '2/3' | '3/4' | '1'

export type GridCell = {
  id: string
  // `null`: the cell shares what the cells with a width leave on its row.
  width: GridCellWidth | null
  blocs: Array<LeafBloc>
}

export type GridBloc = {
  class: 'GridBloc'
  id: string
  cells: Array<GridCell>
}

export type AccordionContentBloc = GridBloc | Exclude<LeafBloc, ExploreBloc>

export type AccordionItemBloc = {
  title: string
  content: Array<AccordionContentBloc>
}

export type AccordionListBloc = {
  class: 'AccordionListBloc'
  id: string
  items: Array<AccordionItemBloc>
}

export type SectionContentBloc = GridBloc | AccordionListBloc | LeafBloc

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
