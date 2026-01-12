import { RiDatabase2Line, RiLineChartLine, RiLink, RiListCheck2, RiRobot2Line, RiWindow2Line } from '@remixicon/vue'
import type { AccordionListBloc, DataservicesListBloc, DatasetsListBloc, HeroBloc, LinksListBloc, ReusesListBloc } from '~/types/pages'

export function useContentBlocsTypes() {
  const { t } = useTranslation()

  return {
    DatasetsListBloc: {
      icon: RiDatabase2Line,
      name: t('Données à la une'),
      description: t('Mettre en avant jusqu\'à 4 jeux de données'),
      default: (): Omit<DatasetsListBloc, 'id'> => ({ class: 'DatasetsListBloc', title: t('Mes jeux de données'), subtitle: null, datasets: [] }),
    },
    DataservicesListBloc: {
      icon: RiRobot2Line,
      name: t('APIs à la une'),
      description: t('Mettre en avant jusqu\'à 4 APIs'),
      default: (): Omit<DataservicesListBloc, 'id'> => ({ class: 'DataservicesListBloc', title: t('Mes APIs'), subtitle: null, dataservices: [] }),
    },
    ReusesListBloc: {
      icon: RiLineChartLine,
      name: t('Réutilisations à la une'),
      description: t('Mettre en avant jusqu\'à 4 réutilisations'),
      default: (): Omit<ReusesListBloc, 'id'> => ({ class: 'ReusesListBloc', title: t('Mes réutilisations'), subtitle: null, reuses: [] }),
    },
    LinksListBloc: {
      icon: RiLink,
      name: t('Liens à la une'),
      description: t('Mettre en avant jusqu\'à 4 liens'),
      default: (): Omit<LinksListBloc, 'id'> => ({ class: 'LinksListBloc', title: t('Mes liens'), subtitle: null, paragraph: null, main_link_title: null, main_link_url: null, links: [] }),
    },
  }
}

export function useBlocsTypes() {
  const contentBlocsTypes = useContentBlocsTypes()
  const { t } = useTranslation()

  return {
    ...contentBlocsTypes,
    AccordionListBloc: {
      icon: RiListCheck2,
      name: t('Accordéon'),
      description: t('Liste dépliable de contenus (FAQ, etc.)'),
      default: (): Omit<AccordionListBloc, 'id'> => ({ class: 'AccordionListBloc', title: '', description: '', items: [] }),
    },
    HeroBloc: {
      icon: RiWindow2Line,
      name: t('Hero'),
      description: t('Bandeau d\'en-tête avec titre et description'),
      default: (): Omit<HeroBloc, 'id'> => ({ class: 'HeroBloc', title: 'Titre', description: null, color: 'primary' }),
    },
  }
}
