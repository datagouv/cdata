import type { InjectionKey } from 'vue'
import type { PageBloc, SectionContentBloc } from '~/types/pages'
import type { Dragged } from '~/composables/useBlocsDrag'

export type BlocClass = PageBloc['class'] | SectionContentBloc['class']

// Where blocs live: the page itself (sections and heroes), a section, an accordion item
// or a grid cell. Each level only accepts some blocs (see `AddBlocDropdown`).
export type BlocsLevel = 'page' | 'section' | 'accordion' | 'cell'

// Provided by each list of blocs to the blocs it holds.
export const BLOCS_LEVEL: InjectionKey<Exclude<BlocsLevel, 'page'>> = Symbol('blocs-level')

// Provided by an accordion to the blocs it holds, down to the cells of its grids: the
// explorer is too wide to go anywhere in it.
export const IN_ACCORDION: InjectionKey<boolean> = Symbol('in-accordion')

// Mirrors the layout udata enforces (`check_blocs_layout`).
const LEAF_BLOCS: Array<BlocClass> = ['TitleBloc', 'MarkdownBloc', 'LinksListBloc', 'ExploreBloc', 'DatasetBloc', 'DataserviceBloc', 'ReuseBloc']
export const ACCEPTED_BLOCS: Record<BlocsLevel, Array<BlocClass>> = {
  page: ['SectionBloc', 'HeroBloc'],
  section: [...LEAF_BLOCS, 'GridBloc', 'AccordionListBloc'],
  accordion: [...LEAF_BLOCS, 'GridBloc'],
  cell: LEAF_BLOCS,
}

// The classes of a dragged bloc: its own, and those of the blocs it holds when it is a grid.
export function draggedClasses(bloc: SectionContentBloc): Array<BlocClass> {
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
