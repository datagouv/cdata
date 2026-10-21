import type { Component } from 'vue'
import { RiDatabase2Line, RiHeading, RiLayoutColumnLine, RiLayoutRowLine, RiLineChartLine, RiLink, RiListCheck2, RiMarkdownLine, RiTerminalLine, RiWindow2Line } from '@remixicon/vue'
import { v4 as uuidv4 } from 'uuid'
import type { AccordionListBloc, GridBloc, GridCellWidth, HeroBloc, LinksListBloc, MarkdownBloc, ObjectBloc, SectionBloc, TitleBloc } from '~/types/pages'
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

// Same widths as the former lists of cards: reuses fit three per row, the others two.
export const OBJECT_CELL_WIDTH: Record<ObjectBloc['class'], GridCellWidth> = {
  DatasetBloc: '1/2',
  DataserviceBloc: '1/2',
  ReuseBloc: '1/3',
}

// Where blocs live: the page itself (sections and heroes), a section, an accordion item
// or a grid cell. Each level only accepts some blocs (see `AddBlocDropdown`).
export type BlocsLevel = 'page' | 'section' | 'accordion' | 'cell'

// Mirrors the layout udata enforces (`check_blocs_layout`).
const LEAF_BLOCS = ['TitleBloc', 'MarkdownBloc', 'LinksListBloc', 'ExploreBloc', 'DatasetBloc', 'DataserviceBloc', 'ReuseBloc']
const ACCEPTED_BLOCS: Record<Exclude<BlocsLevel, 'page'>, Array<string>> = {
  section: [...LEAF_BLOCS, 'GridBloc', 'AccordionListBloc'],
  // The explorer is too wide for an accordion.
  accordion: [...LEAF_BLOCS.filter(name => name !== 'ExploreBloc'), 'GridBloc'],
  cell: LEAF_BLOCS,
}

// Whether a bloc dragged from another list (`data-bloc-class`) can be dropped in this one
// (`data-blocs-level`).
export function acceptsDroppedBloc(item: HTMLElement, list: HTMLElement): boolean {
  const level = list.dataset.blocsLevel as Exclude<BlocsLevel, 'page'> | undefined
  return !!level && !!item.dataset.blocClass && ACCEPTED_BLOCS[level].includes(item.dataset.blocClass)
}

// Name of a bloc in the editor, on the tab shown when it is hovered.
export function useBlocLabels(): Record<string, string> {
  const { t } = useTranslation()
  return {
    HeroBloc: t('Hero'),
    SectionBloc: t('Section'),
    GridBloc: t('Grille'),
    GridCell: t('Cellule'),
    AccordionListBloc: t('Accordéon'),
    AccordionItem: t('Élément'),
    TitleBloc: t('Titre'),
    MarkdownBloc: t('Texte'),
    LinksListBloc: t('Liens'),
    ExploreBloc: t('Explorateur'),
    DatasetBloc: t('Jeu de données'),
    DataserviceBloc: t('API'),
    ReuseBloc: t('Réutilisation'),
  }
}

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
      // Cells are added with their content, see `GridBloc`.
      create: (): GridBloc => ({ class: 'GridBloc', id: uuidv4(), cells: [] }),
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
