import type { Dataservice, DatasetV2, Reuse } from '@datagouv/components-next'

export type Page = {
  id: string
  blocs: Array<PageBloc>
}

export type BlocWithTitle = {
  title: string
  subtitle: string | null
}

export type DatasetsListBloc = {
  type: 'datasets_list'
  datasets: Array<DatasetV2>
} & BlocWithTitle
export type DataservicesListBloc = {
  type: 'dataservices_list'
  dataservices: Array<Dataservice>
} & BlocWithTitle
export type ReusesListBloc = {
  type: 'reuses_list'
  reuses: Array<Reuse>
} & BlocWithTitle

export type LinkInBloc = {
  title: string
  url: string
  color: string | null
}

export type LinksListBloc = {
  type: 'links_list'
  paragraph: string | null
  main_link_title: string | null
  main_link_url: string | null
  links: Array<LinkInBloc>
} & BlocWithTitle

export type PageBloc = (DatasetsListBloc | DataservicesListBloc | ReusesListBloc | LinksListBloc) & { id: string }
