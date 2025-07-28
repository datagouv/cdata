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
  type: 'DatasetsListBloc'
  datasets: Array<DatasetV2>
} & BlocWithTitle & { id: string }
export type DataservicesListBloc = {
  type: 'DataservicesListBloc'
  dataservices: Array<Dataservice>
} & BlocWithTitle & { id: string }
export type ReusesListBloc = {
  type: 'ReusesListBloc'
  reuses: Array<Reuse>
} & BlocWithTitle & { id: string }

export type LinkInBloc = {
  title: string
  url: string
  color: string | null
}

export type LinksListBloc = {
  type: 'LinksListBloc'
  paragraph: string | null
  main_link_title: string | null
  main_link_url: string | null
  links: Array<LinkInBloc>
} & BlocWithTitle & { id: string }

export type PageBloc = DatasetsListBloc | DataservicesListBloc | ReusesListBloc | LinksListBloc
