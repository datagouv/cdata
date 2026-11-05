import { describe, expect, it } from 'vitest'
import { acceptsDropped, rowShare, rowSpacings, rowStarts } from '~/utils/blocsLayout'
import type { Dragged } from '~/composables/useBlocsDrag'
import type { BlocWidth } from '~/types/pages'
import type { BlocClass, RowSpacing } from '~/utils/blocsLayout'

const bloc = (blocClass: BlocClass): Dragged => ({ kind: 'bloc', blocClass })

// The same layout as udata's `check_blocs_layout` (see `PostBlocsLayoutAPITest`): what the
// editor lets through must save.
type Case = [name: string, level: Parameters<typeof acceptsDropped>[0], dragged: Dragged, accepted: boolean]

describe('acceptsDropped', () => {
  it.each<Case>([
    ['a title in a section', 'section', bloc('TitleBloc'), true],
    ['the explorer in a section', 'section', bloc('ExploreBloc'), true],
    ['an accordion in a section', 'section', bloc('AccordionListBloc'), true],
    ['a dataset in an accordion item', 'accordion', bloc('DatasetBloc'), true],
    ['an accordion in an accordion item', 'accordion', bloc('AccordionListBloc'), false],
    ['the explorer in an accordion item', 'accordion', bloc('ExploreBloc'), false],
    ['a column in a section', 'section', bloc('ColumnBloc'), true],
    ['a column in an accordion item', 'accordion', bloc('ColumnBloc'), true],
    ['a title in a column', 'column', bloc('TitleBloc'), true],
    ['a column in a column', 'column', bloc('ColumnBloc'), false],
    ['an accordion in a column', 'column', bloc('AccordionListBloc'), false],
    ['the explorer in a column', 'column', bloc('ExploreBloc'), false],
    ['a section in a section', 'section', { kind: 'band' }, false],
    ['an accordion item in a section', 'section', { kind: 'accordion-item' }, false],
  ])('%s', (_name, level, dragged, accepted) => {
    expect(acceptsDropped(level, dragged)).toBe(accepted)
  })
})

describe('rowStarts', () => {
  it.each<[name: string, widths: Array<BlocWidth | null>, starts: Array<number>]>([
    ['full width blocs, one per row', [null, null, null], [0, 1, 2]],
    ['halves, two per row', ['1/2', '1/2', '1/2'], [0, 2]],
    ['thirds then a full width bloc', ['1/3', '1/3', '1/3', null], [0, 3]],
    ['a bloc that does not fit in what is left of the row', ['2/3', '1/2', '1/2'], [0, 1]],
    ['a row left incomplete by a full width bloc', ['1/4', null, '3/4', '1/4'], [0, 1, 2]],
    ['no bloc', [], []],
  ])('%s', (_name, widths, starts) => {
    expect(rowStarts(widths)).toEqual(starts)
  })
})

describe('rowShare', () => {
  it('counts the gap after a bloc, but not after the last one of a row', () => {
    // A row of 1000px with gaps of 20px: two halves of 490px, or the whole row
    expect(rowShare(490, 1000, 20)).toBeCloseTo(0.5)
    expect(rowShare(1000, 1000, 20)).toBeCloseTo(1)
  })
})

describe('rowSpacings', () => {
  const at = (blocClass: BlocClass, width: BlocWidth | null = null) => ({ class: blocClass, width }) as Parameters<typeof rowSpacings>[0][number]

  it.each<[name: string, blocs: Parameters<typeof rowSpacings>[0], spacings: Array<RowSpacing>]>([
    ['a title close to what follows it', [at('TitleBloc'), at('MarkdownBloc')], ['none', 'after-title']],
    ['cards wrapping on two rows, as close as in a row', [at('DatasetBloc', '1/2'), at('DatasetBloc', '1/2'), at('DatasetBloc', '1/2')], ['none', 'none', 'column-gap']],
    ['a row of another kind of blocs further apart', [at('DatasetBloc', '1/2'), at('DatasetBloc', '1/2'), at('ReuseBloc', '1/3')], ['none', 'none', 'between-rows']],
    ['full width texts further apart', [at('MarkdownBloc'), at('MarkdownBloc')], ['none', 'between-rows']],
    ['a row after a lone card further apart', [at('DatasetBloc', '1/2'), at('MarkdownBloc'), at('DatasetBloc', '1/2'), at('DatasetBloc', '1/2')], ['none', 'between-rows', 'between-rows', 'between-rows']],
  ])('%s', (_name, blocs, spacings) => {
    expect(rowSpacings(blocs)).toEqual(spacings)
  })
})
