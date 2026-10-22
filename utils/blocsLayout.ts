import type { InjectionKey } from 'vue'
import type { BlocWidth, PageBloc, SectionContentBloc } from '~/types/pages'
import type { Dragged } from '~/composables/useBlocsDrag'

export type BlocClass = PageBloc['class'] | SectionContentBloc['class']

// Where blocs live: the page itself (sections and heroes), a section or an accordion item.
// Each level only accepts some blocs (see `AddBlocDropdown`).
export type BlocsLevel = 'page' | 'section' | 'accordion'

// Provided by each list of blocs to the blocs it holds.
export const BLOCS_LEVEL: InjectionKey<Exclude<BlocsLevel, 'page'>> = Symbol('blocs-level')

// Mirrors the layout udata enforces (`check_blocs_layout`).
const LEAF_BLOCS: Array<BlocClass> = ['TitleBloc', 'MarkdownBloc', 'LinksListBloc', 'ExploreBloc', 'DatasetBloc', 'DataserviceBloc', 'ReuseBloc']
export const ACCEPTED_BLOCS: Record<BlocsLevel, Array<BlocClass>> = {
  page: ['SectionBloc', 'HeroBloc'],
  section: [...LEAF_BLOCS, 'AccordionListBloc'],
  // The explorer is too wide for an accordion.
  accordion: LEAF_BLOCS.filter(name => name !== 'ExploreBloc'),
}

// Whether a dragged bloc can be dropped in a section or an accordion item.
export function acceptsDropped(level: Exclude<BlocsLevel, 'page'>, dragged: Dragged): boolean {
  return dragged.kind === 'bloc' && ACCEPTED_BLOCS[level].includes(dragged.blocClass)
}

// Columns of the 12 columns grid of a section or an accordion item, from the narrowest.
export const BLOC_SPANS: Record<BlocWidth, number> = { '1/4': 3, '1/3': 4, '1/2': 6, '2/3': 8, '3/4': 9, '1': 12 }

// The index of the first bloc of each row, as the grid lays them out: a bloc goes to the
// next row when it does not fit in what is left of the current one.
export function rowStarts(widths: Array<BlocWidth | null>): Array<number> {
  const starts: Array<number> = []
  let used = 12
  widths.forEach((width, index) => {
    const span = BLOC_SPANS[width ?? '1']
    if (used + span > 12) {
      starts.push(index)
      used = 0
    }
    used += span
  })
  return starts
}

// The space above a row of blocs: none for the first one; after a title, little, as it stays
// close to what it introduces; between rows of a same kind of blocs (cards wrapping on
// several rows), the gap between the blocs of a row; between other rows, more.
export type RowSpacing = 'none' | 'after-title' | 'column-gap' | 'between-rows'

// The spacing above the row of each bloc, by bloc: the blocs of a row share it, so that they
// stay aligned.
export function rowSpacings(blocs: Array<Pick<SectionContentBloc, 'class' | 'width'>>): Array<RowSpacing> {
  const starts = rowStarts(blocs.map(bloc => bloc.width))
  const rows = starts.map((start, index) => blocs.slice(start, starts[index + 1]))
  return rows.flatMap((row, index) => {
    const previous = rows[index - 1]
    let spacing: RowSpacing = 'between-rows'
    if (!previous) spacing = 'none'
    else if (previous.length === 1 && previous[0].class === 'TitleBloc') spacing = 'after-title'
    else if (previous.length > 1 && [...previous, ...row].every(bloc => bloc.class === row[0].class)) spacing = 'column-gap'
    return row.map(() => spacing)
  })
}
