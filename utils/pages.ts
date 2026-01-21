import { RiDatabase2Line, RiLineChartLine, RiLink, RiListCheck2, RiMarkdownLine, RiRobot2Line, RiWindow2Line } from '@remixicon/vue'
import type { AccordionListBloc, DataservicesListBloc, DatasetsListBloc, HeroBloc, LinksListBloc, MarkdownBloc, ReusesListBloc } from '~/types/pages'
import DatasetsListBlocComponent from '~/components/Pages/DatasetsListBloc.vue'
import DataservicesListBlocComponent from '~/components/Pages/DataservicesListBloc.vue'
import ReusesListBlocComponent from '~/components/Pages/ReusesListBloc.vue'
import LinksListBlocComponent from '~/components/Pages/LinksListBloc.vue'
import MarkdownBlocComponent from '~/components/Pages/MarkdownBloc.vue'
import AccordionBlocEditorComponent from '~/components/Pages/AccordionBlocEditor.vue'
import HeroBlocComponent from '~/components/Pages/HeroBloc.vue'

export function useContentBlocsTypes() {
  const { t } = useTranslation()

  return {
    DatasetsListBloc: {
      icon: RiDatabase2Line,
      name: t('Données à la une'),
      description: t('Mettre en avant jusqu\'à 4 jeux de données'),
      component: DatasetsListBlocComponent,
      default: (): Omit<DatasetsListBloc, 'id'> => ({ class: 'DatasetsListBloc', title: t('Mes jeux de données'), subtitle: null, datasets: [] }),
    },
    DataservicesListBloc: {
      icon: RiRobot2Line,
      name: t('APIs à la une'),
      description: t('Mettre en avant jusqu\'à 4 APIs'),
      component: DataservicesListBlocComponent,
      default: (): Omit<DataservicesListBloc, 'id'> => ({ class: 'DataservicesListBloc', title: t('Mes APIs'), subtitle: null, dataservices: [] }),
    },
    ReusesListBloc: {
      icon: RiLineChartLine,
      name: t('Réutilisations à la une'),
      description: t('Mettre en avant jusqu\'à 4 réutilisations'),
      component: ReusesListBlocComponent,
      default: (): Omit<ReusesListBloc, 'id'> => ({ class: 'ReusesListBloc', title: t('Mes réutilisations'), subtitle: null, reuses: [] }),
    },
    LinksListBloc: {
      icon: RiLink,
      name: t('Liens à la une'),
      description: t('Mettre en avant jusqu\'à 4 liens'),
      component: LinksListBlocComponent,
      default: (): Omit<LinksListBloc, 'id'> => ({ class: 'LinksListBloc', title: t('Mes liens'), subtitle: null, paragraph: null, main_link_title: null, main_link_url: null, links: [] }),
    },
    MarkdownBloc: {
      icon: RiMarkdownLine,
      name: t('Bloc Markdown'),
      description: t('Ajouter du contenu texte riche'),
      component: MarkdownBlocComponent,
      default: (): Omit<MarkdownBloc, 'id'> => ({ class: 'MarkdownBloc', title: 'Titre', subtitle: null, content: '' }),
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
      component: AccordionBlocEditorComponent,
      default: (): Omit<AccordionListBloc, 'id'> => ({ class: 'AccordionListBloc', title: t('Mon accordéon'), description: null, items: [] }),
    },
    HeroBloc: {
      icon: RiWindow2Line,
      name: t('Hero'),
      description: t('Bandeau d\'en-tête avec titre et description'),
      component: HeroBlocComponent,
      fullWidth: true,
      default: (): Omit<HeroBloc, 'id'> => ({ class: 'HeroBloc', title: 'Titre', description: null, color: 'primary' }),
    },
  }
}
