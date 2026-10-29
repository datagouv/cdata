import type { DatasetV2 } from './datasets'
import type { Dataservice } from './dataservices'
import type { Reuse } from './reuses'

export type BlocWidth = '1/4' | '1/3' | '1/2' | '2/3' | '3/4'

// Blocs inside a section, an accordion item or a column sit side by side, wrapping to a new
// row when the row is full. `null`: the whole row.
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
  links: Array<LinkInBloc>
}

export type ButtonBloc = Sized & {
  class: 'ButtonBloc'
  id: string
  title: string
  url: string
}

export type ImageBloc = Sized & {
  class: 'ImageBloc'
  id: string
  image: string
  // `null`: a decorative image, which screen readers skip.
  alt: string | null
}

// A link to a page, shown as a card: the summary pages list their subpages with them.
export type CardBloc = Sized & {
  class: 'CardBloc'
  id: string
  title: string
  url: string
  description: string | null
  image: string | null
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

export type LeafBloc = TitleBloc | MarkdownBloc | LinksListBloc | ButtonBloc | ImageBloc | CardBloc | ExploreBloc | ObjectBloc

// The explorer is too wide for a column, a share of a row, or for an accordion.
export type ColumnContentBloc = Exclude<LeafBloc, ExploreBloc>

// Blocs stacked in a share of a row, beside the others: a title and its text beside an
// illustration.
export type ColumnBloc = Sized & {
  class: 'ColumnBloc'
  id: string
  blocs: Array<ColumnContentBloc>
}

export type AccordionContentBloc = ColumnContentBloc | ColumnBloc

export type AccordionItemBloc = {
  id: string
  title: string
  content: Array<AccordionContentBloc>
}

export type AccordionListBloc = Sized & {
  class: 'AccordionListBloc'
  id: string
  items: Array<AccordionItemBloc>
}

export type SectionContentBloc = AccordionListBloc | ColumnBloc | LeafBloc

export type SectionColor = 'primary' | 'green' | 'purple'

export type SectionBloc = {
  class: 'SectionBloc'
  id: string
  // `null`: the sections of the page alternate their neutral backgrounds.
  color: SectionColor | null
  blocs: Array<SectionContentBloc>
}

// The blocs of a page, from the top.
export type PageBloc = SectionBloc
