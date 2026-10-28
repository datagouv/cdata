import type { InjectionKey } from 'vue'
import type { BlocWidth, PageBloc, SectionContentBloc } from '~/types/pages'
import type { Dragged } from '~/composables/useBlocsDrag'

export type BlocClass = PageBloc['class'] | SectionContentBloc['class']

// Where blocs live, under the sections of a page: a section or an accordion item. Each level
// only accepts some blocs (see `AddBlocDropdown`).
export type BlocsLevel = 'section' | 'accordion'

// Provided by each list of blocs to the blocs it holds.
export const BLOCS_LEVEL: InjectionKey<BlocsLevel> = Symbol('blocs-level')

// Mirrors the layout udata enforces (`check_blocs_layout`).
const LEAF_BLOCS: Array<BlocClass> = ['TitleBloc', 'MarkdownBloc', 'LinksListBloc', 'ButtonBloc', 'ImageBloc', 'CardBloc', 'ExploreBloc', 'DatasetBloc', 'DataserviceBloc', 'ReuseBloc']
export const ACCEPTED_BLOCS: Record<BlocsLevel, Array<BlocClass>> = {
  section: [...LEAF_BLOCS, 'AccordionListBloc'],
  // The explorer is too wide for an accordion.
  accordion: LEAF_BLOCS.filter(name => name !== 'ExploreBloc'),
}

// Whether a dragged bloc can be dropped in a section or an accordion item.
export function acceptsDropped(level: BlocsLevel, dragged: Dragged): boolean {
  return dragged.kind === 'bloc' && ACCEPTED_BLOCS[level].includes(dragged.blocClass)
}

// A share of the row, the whole one included: stored as no width at all (`null`).
export type RowWidth = BlocWidth | 'whole'

// Columns of the 12 columns grid of a section or an accordion item, from the narrowest.
export const BLOC_SPANS: Record<RowWidth, number> = { '1/4': 3, '1/3': 4, '1/2': 6, '2/3': 8, '3/4': 9, 'whole': 12 }

// The share of a row a bloc takes, from its width on screen: the row is made of the blocs
// and the gaps between them, the last bloc having no gap after it.
export function rowShare(blocWidth: number, rowWidth: number, gap: number): number {
  return (blocWidth + gap) / (rowWidth + gap)
}

// The gap between the blocs of a row of a list, as laid out.
export function columnGap(list: HTMLElement): number {
  return Number.parseFloat(getComputedStyle(list).columnGap) || 0
}

// The share of the row of its list a bloc takes on screen, from its left edge to `right`.
export function renderedShare(bloc: HTMLElement, list: HTMLElement, right = bloc.getBoundingClientRect().right): number {
  return rowShare(right - bloc.getBoundingClientRect().left, list.getBoundingClientRect().width, columnGap(list))
}

// The index of the first bloc of each row, as the grid lays them out: a bloc goes to the
// next row when it does not fit in what is left of the current one.
export function rowStarts(widths: Array<BlocWidth | null>): Array<number> {
  const starts: Array<number> = []
  let used = 12
  widths.forEach((width, index) => {
    const span = BLOC_SPANS[width ?? 'whole']
    if (used + span > 12) {
      starts.push(index)
      used = 0
    }
    used += span
  })
  return starts
}

export type LaidOutBloc = Pick<SectionContentBloc, 'class' | 'width'>

// Where a bloc stands beside an image covering several rows: in the first of them, or in the
// following ones.
export type BesideImage = 'first-row' | 'next-rows'

export type ImageRows = {
  // The rows each bloc covers: more than one for such an image.
  spans: Array<number>
  beside: Array<BesideImage | null>
  // The columns such an image leaves to the blocs beside it: what a bloc added among them
  // takes, not to cut through the image.
  freeColumns: Array<number | null>
  groups: Array<ImageGroup>
}

// Such an image and the blocs beside it, which read as a column next to it.
export type ImageGroup = {
  image: number
  // In their order: those of the image's own row, then those of the next rows.
  beside: Array<number>
  firstRow: number
  side: 'left' | 'right'
  free: number
}

// An image at either end of a row of several blocs also covers the rows after it that fit in
// the columns it leaves: a banner, its title and its text on one side and its illustration on
// the other. The grid places these rows beside it by itself.
export function imageRows(blocs: Array<LaidOutBloc>): ImageRows {
  const starts = rowStarts(blocs.map(bloc => bloc.width))
  const rows = starts.map((start, index) => ({ start, end: starts[index + 1] ?? blocs.length }))
  const columns = (row: { start: number, end: number }) => blocs.slice(row.start, row.end)
    .reduce((sum, bloc) => sum + BLOC_SPANS[bloc.width ?? 'whole'], 0)
  const hasImage = (row: { start: number, end: number }) => blocs.slice(row.start, row.end)
    .some(bloc => bloc.class === 'ImageBloc')

  const spans = blocs.map(() => 1)
  const beside: Array<BesideImage | null> = blocs.map(() => null)
  const freeColumns: Array<number | null> = blocs.map(() => null)
  const groups: Array<ImageGroup> = []
  rows.forEach((row, rowIndex) => {
    const images = blocs.slice(row.start, row.end).flatMap((bloc, offset) => bloc.class === 'ImageBloc' ? [row.start + offset] : [])
    const image = images[0]
    if (row.end - row.start < 2 || images.length !== 1 || (image !== row.start && image !== row.end - 1)) return
    const free = 12 - BLOC_SPANS[blocs[image]!.width ?? 'whole']
    const covered = []
    for (const next of rows.slice(rowIndex + 1)) {
      if (hasImage(next) || columns(next) > free) break
      covered.push(next)
    }
    if (!covered.length) return
    spans[image] += covered.length
    const group: ImageGroup = { image, beside: [], firstRow: row.end - row.start - 1, side: image === row.start ? 'left' : 'right', free }
    for (let index = row.start; index < row.end; index++) {
      if (index !== image) {
        beside[index] = 'first-row'
        freeColumns[index] = free
        group.beside.push(index)
      }
    }
    for (const next of covered) {
      for (let index = next.start; index < next.end; index++) {
        beside[index] = 'next-rows'
        freeColumns[index] = free
        group.beside.push(index)
      }
    }
    groups.push(group)
  })
  return { spans, beside, freeColumns, groups }
}

// Lays out again the blocs of a group, once reordered: as many as before on the image's own
// row, the image keeping its side.
function layOutGroup<T extends LaidOutBloc>(blocs: Array<T>, image: T, beside: Array<T>, group: ImageGroup, start: number, length: number) {
  const firstRow = Math.max(1, Math.min(group.firstRow, beside.length))
  const ordered = group.side === 'right'
    ? [...beside.slice(0, firstRow), image, ...beside.slice(firstRow)]
    : [image, ...beside]
  blocs.splice(start, length, ...ordered)
}

/**
 * Moves the bloc `from` to the index `to` it has once moved, or inserts `moved` (from another
 * list) at `to`. Among the blocs beside an image covering several rows, it is reordered with
 * them, the image keeping its side: it reads as a column next to the image, and moving its
 * title under its text must not send the image to the other side. A bloc landing there takes
 * at most the width the image leaves.
 */
export function moveBloc<T extends LaidOutBloc>(blocs: Array<T>, from: number, to: number, moved?: T) {
  const { groups } = imageRows(blocs)
  const item = moved ?? blocs[from]!
  const after = (index: number) => (moved || index < from ? index : index - 1)
  if (!moved) blocs.splice(from, 1)

  const group = groups.find((group) => {
    if (!moved && group.image === from) return false
    const indexes = [group.image, ...group.beside].filter(index => moved || index !== from).map(after)
    return Math.min(...indexes) <= to && to <= Math.max(...indexes) + 1
  })
  if (!group) {
    blocs.splice(to, 0, item)
    return
  }
  const image = after(group.image)
  const beside = group.beside.filter(index => moved || index !== from).map(after)
  const start = Math.min(image, ...beside)
  const column = beside.map(index => blocs[index]!)
  column.splice(beside.filter(index => index < to).length, 0, item)
  if (BLOC_SPANS[item.width ?? 'whole'] > group.free) {
    item.width = (Object.keys(BLOC_SPANS) as Array<RowWidth>).find(width => BLOC_SPANS[width] === group.free) as BlocWidth
  }
  layOutGroup(blocs, blocs[image]!, column, group, start, beside.length + 1)
}

/**
 * Moves the bloc `index` one step: among the blocs beside an image covering several rows, to
 * the next one of them, the image keeping its side (see `moveBloc`). Tells whether it moved.
 */
export function stepBloc<T extends LaidOutBloc>(blocs: Array<T>, index: number, direction: -1 | 1): boolean {
  const group = imageRows(blocs).groups.find(group => group.beside.includes(index))
  const position = group ? group.beside.indexOf(index) + direction : -1
  if (group && position >= 0 && position < group.beside.length) {
    const column = group.beside.map(index => blocs[index]!)
    const [item] = column.splice(position - direction, 1)
    column.splice(position, 0, item!)
    const start = Math.min(group.image, ...group.beside)
    layOutGroup(blocs, blocs[group.image]!, column, group, start, group.beside.length + 1)
    return true
  }
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= blocs.length) return false
  const [item] = blocs.splice(index, 1)
  blocs.splice(newIndex, 0, item!)
  return true
}

// The space above a row of blocs: none for the first one; after a title, little, as it stays
// close to what it introduces; between rows of a same kind of blocs (cards wrapping on
// several rows), the gap between the blocs of a row; between other rows, more.
export type RowSpacing = 'none' | 'after-title' | 'column-gap' | 'between-rows'

// The spacing above the row of each bloc, by bloc: the blocs of a row share it, so that they
// stay aligned.
export function rowSpacings(blocs: Array<LaidOutBloc>): Array<RowSpacing> {
  const starts = rowStarts(blocs.map(bloc => bloc.width))
  const { spans } = imageRows(blocs)
  const rows = starts.map((start, index) => blocs.slice(start, starts[index + 1]))
  // An image covering the rows after its own stands beside them, not above them.
  const above = starts.map((start, index) => blocs
    .slice(start, starts[index + 1])
    .filter((_bloc, offset) => spans[start + offset] === 1))
  return rows.flatMap((row, index) => {
    const previous = above[index - 1]
    let spacing: RowSpacing = 'between-rows'
    if (!previous) spacing = 'none'
    else if (previous.length === 1 && previous[0].class === 'TitleBloc') spacing = 'after-title'
    else if (previous.length > 1 && [...previous, ...row].every(bloc => bloc.class === row[0].class)) spacing = 'column-gap'
    return row.map(() => spacing)
  })
}
