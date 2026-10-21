import type { Component, InjectionKey } from 'vue'
import { RiDatabase2Line, RiHeading, RiLayoutColumnLine, RiLayoutRowLine, RiLineChartLine, RiLink, RiListCheck2, RiMarkdownLine, RiTerminalLine, RiWindow2Line } from '@remixicon/vue'
import { v4 as uuidv4 } from 'uuid'
import type { AccordionListBloc, GridBloc, GridCellWidth, HeroBloc, LinksListBloc, MarkdownBloc, ObjectBloc, SectionBloc, SectionContentBloc, TitleBloc } from '~/types/pages'
import type { Dragged } from '~/composables/useBlocsDrag'
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
export const ACCEPTED_BLOCS: Record<BlocsLevel, Array<string>> = {
  page: ['SectionBloc', 'HeroBloc'],
  section: [...LEAF_BLOCS, 'GridBloc', 'AccordionListBloc'],
  accordion: [...LEAF_BLOCS, 'GridBloc'],
  cell: LEAF_BLOCS,
}

// Provided by an accordion to the blocs it holds, down to the cells of its grids: the
// explorer is too wide to go anywhere in it.
export const IN_ACCORDION: InjectionKey<boolean> = Symbol('in-accordion')

// The classes of a dragged bloc: its own, and those of the blocs it holds when it is a grid.
export function draggedClasses(bloc: SectionContentBloc): Array<string> {
  return bloc.class === 'GridBloc'
    ? [bloc.class, ...bloc.cells.flatMap(cell => cell.blocs.map(cellBloc => cellBloc.class))]
    : [bloc.class]
}

// Whether a dragged bloc or cell can be dropped in a list of blocs (`section`, `accordion`,
// `cell`) or among the cells of a grid (`grid`). A grid takes a bloc as a new cell; a list
// of blocs takes a cell as the blocs it holds, so all of them must be allowed there.
export function acceptsDropped(level: Exclude<BlocsLevel, 'page'> | 'grid', dragged: Dragged, inAccordion: boolean): boolean {
  if (dragged.kind !== 'bloc' && dragged.kind !== 'cell') return false
  if (inAccordion && dragged.classes.includes('ExploreBloc')) return false
  if (level === 'grid') return dragged.kind === 'cell' || LEAF_BLOCS.includes(dragged.classes[0])
  return dragged.classes.every(name => ACCEPTED_BLOCS[level].includes(name))
}

// Name of a bloc in the editor, on the tab shown when it is hovered.
export function useBlocLabels(): Record<string, string> {
  const { t } = useTranslation()
  return {
    HeroBloc: t('Hero'),
    SectionBloc: t('Section'),
    GridBloc: t('Grille'),
    GridCell: t('Colonne'),
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
