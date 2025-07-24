import type { Dataset } from '@datagouv/components-next'

export type Page = {
  id: string
  blocs: Array<PageBloc>
}

export type DatasetsListBloc = {
  type: 'datasets_list'
  title: string
  subtitle: string | null
  datasets: Array<Dataset>
}
export type PageBloc = DatasetsListBloc & { id: string }
