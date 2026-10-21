import type { Component } from 'vue'
import { RiDatabase2Line, RiHeading, RiLayoutColumnLine, RiLayoutRowLine, RiLineChartLine, RiLink, RiListCheck2, RiMarkdownLine, RiTerminalLine, RiWindow2Line } from '@remixicon/vue'
import { v4 as uuidv4 } from 'uuid'
import type { AccordionListBloc, GridBloc, HeroBloc, LinksListBloc, MarkdownBloc, SectionBloc, TitleBloc } from '~/types/pages'
import TitleBlocComponent from '~/components/Pages/TitleBloc.vue'
import MarkdownBlocComponent from '~/components/Pages/MarkdownBloc.vue'
import LinksListBlocComponent from '~/components/Pages/LinksListBloc.vue'
import DatasetBlocComponent from '~/components/Pages/DatasetBloc.vue'
import DataserviceBlocComponent from '~/components/Pages/DataserviceBloc.vue'
import ReuseBlocComponent from '~/components/Pages/ReuseBloc.vue'
import GridBlocComponent from '~/components/Pages/GridBloc.vue'
import AccordionBlocEditorComponent from '~/components/Pages/AccordionBlocEditor.vue'

// Components rendering the blocs nested in a section, a grid cell or an accordion item.
// Sections and heroes are rendered by `EditoBlocs` itself.
export const BLOC_COMPONENTS: Record<string, Component> = {
  TitleBloc: TitleBlocComponent,
  MarkdownBloc: MarkdownBlocComponent,
  LinksListBloc: LinksListBlocComponent,
  DatasetBloc: DatasetBlocComponent,
  DataserviceBloc: DataserviceBlocComponent,
  ReuseBloc: ReuseBlocComponent,
  GridBloc: GridBlocComponent,
  AccordionListBloc: AccordionBlocEditorComponent,
}

export type ObjectType = 'dataset' | 'dataservice' | 'reuse'

// Where blocs live: the page itself (sections and heroes), a section, an accordion item
// or a grid cell. Each level only accepts some blocs (see `AddBlocDropdown`).
export type BlocsLevel = 'page' | 'section' | 'accordion' | 'cell'

export type BlocChoice = {
  key: string
  icon: Component
  name: string
  description: string
} & (
  | { create: () => SectionBloc | HeroBloc | TitleBloc | MarkdownBloc | LinksListBloc | GridBloc | AccordionListBloc }
  // Objects are picked in a selector before their blocs can be built.
  | { objectType: ObjectType }
)

export function useBlocChoices() {
  const { t } = useTranslation()

  return {
    SectionBloc: {
      key: 'SectionBloc',
      icon: RiLayoutRowLine,
      name: t('Section'),
      description: t('Bande pleine largeur qui regroupe des blocs'),
      create: (): SectionBloc => ({ class: 'SectionBloc', id: uuidv4(), blocs: [] }),
    },
    HeroBloc: {
      key: 'HeroBloc',
      icon: RiWindow2Line,
      name: t('Hero'),
      description: t('Bandeau d\'en-tête avec titre et description'),
      create: (): HeroBloc => ({ class: 'HeroBloc', id: uuidv4(), title: 'Titre', description: null, color: 'primary', main_link_title: null, main_link_url: null }),
    },
    TitleBloc: {
      key: 'TitleBloc',
      icon: RiHeading,
      name: t('Titre'),
      description: t('Titre et sous-titre'),
      create: (): TitleBloc => ({ class: 'TitleBloc', id: uuidv4(), title: t('Titre'), subtitle: null }),
    },
    MarkdownBloc: {
      key: 'MarkdownBloc',
      icon: RiMarkdownLine,
      name: t('Texte'),
      description: t('Ajouter du contenu texte riche'),
      create: (): MarkdownBloc => ({ class: 'MarkdownBloc', id: uuidv4(), content: '' }),
    },
    LinksListBloc: {
      key: 'LinksListBloc',
      icon: RiLink,
      name: t('Liens'),
      description: t('Mettre en avant quelques liens'),
      create: (): LinksListBloc => ({ class: 'LinksListBloc', id: uuidv4(), paragraph: null, main_link_title: null, main_link_url: null, links: [] }),
    },
    GridBloc: {
      key: 'GridBloc',
      icon: RiLayoutColumnLine,
      name: t('Grille'),
      description: t('Disposer des blocs en colonnes'),
      create: (): GridBloc => ({
        class: 'GridBloc',
        id: uuidv4(),
        cells: [
          { id: uuidv4(), width: '1/2', blocs: [] },
          { id: uuidv4(), width: '1/2', blocs: [] },
        ],
      }),
    },
    AccordionListBloc: {
      key: 'AccordionListBloc',
      icon: RiListCheck2,
      name: t('Accordéon'),
      description: t('Liste dépliable de contenus (FAQ, etc.)'),
      create: (): AccordionListBloc => ({ class: 'AccordionListBloc', id: uuidv4(), items: [] }),
    },
    datasets: {
      key: 'datasets',
      icon: RiDatabase2Line,
      name: t('Jeux de données'),
      description: t('Mettre en avant des jeux de données'),
      objectType: 'dataset',
    },
    dataservices: {
      key: 'dataservices',
      icon: RiTerminalLine,
      name: t('API'),
      description: t('Mettre en avant des API'),
      objectType: 'dataservice',
    },
    reuses: {
      key: 'reuses',
      icon: RiLineChartLine,
      name: t('Réutilisations'),
      description: t('Mettre en avant des réutilisations'),
      objectType: 'reuse',
    },
  } satisfies Record<string, BlocChoice>
}
