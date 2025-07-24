import { RiDatabase2Line, RiLineChartLine, RiLink, RiRobot2Line } from '@remixicon/vue'
import type { DataservicesListBloc, DatasetsListBloc, LinksListBloc, ReusesListBloc } from '~/types/pages'

export function useBlocsTypes() {
  const { t } = useI18n()

  return {
    datasets_list: {
      icon: RiDatabase2Line,
      name: t('Données à la une'),
      description: t('Mettre en avant jusqu\'à 4 jeux de données'),
      default: (): Omit<DatasetsListBloc, 'id'> => ({ type: 'datasets_list', title: 'Mes jeux de données', subtitle: '', datasets: [] }),
    },
    dataservices_list: {
      icon: RiRobot2Line,
      name: t('APIs à la une'),
      description: t('Mettre en avant jusqu\'à 4 APIs'),
      default: (): Omit<DataservicesListBloc, 'id'> => ({ type: 'dataservices_list', title: 'Mes APIs', subtitle: '', dataservices: [] }),
    },
    reuses_list: {
      icon: RiLineChartLine,
      name: t('Réutilisations à la une'),
      description: t('Mettre en avant jusqu\'à 4 réutilisations'),
      default: (): Omit<ReusesListBloc, 'id'> => ({ type: 'reuses_list', title: 'Mes réutilisations', subtitle: '', reuses: [] }),
    },
    links_list: {
      icon: RiLink,
      name: t('Liens à la une'),
      description: t('Mettre en avant jusqu\'à 4 liens'),
      default: (): Omit<LinksListBloc, 'id'> => ({ type: 'links_list', title: 'Mes liens', subtitle: '', paragraph: '', main_link_title: '', main_link_url: '', links: [] }),
    },
  }
}
