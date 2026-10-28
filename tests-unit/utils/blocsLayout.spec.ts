import { describe, expect, it } from 'vitest'
import { acceptsDropped, imageRows, rowShare, rowSpacings, rowStarts } from '~/utils/blocsLayout'
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
    ['a text close to the title it follows beside an image', [at('TitleBloc', '3/4'), at('ImageBloc', '1/4'), at('MarkdownBloc', '3/4')], ['none', 'none', 'after-title']],
  ])('%s', (_name, blocs, spacings) => {
    expect(rowSpacings(blocs)).toEqual(spacings)
  })
})

describe('imageRows', () => {
  const at = (blocClass: BlocClass, width: BlocWidth | null = null) => ({ class: blocClass, width }) as Parameters<typeof imageRows>[0][number]

  it.each<[name: string, blocs: Parameters<typeof imageRows>[0], spans: Array<number>, beside: ReturnType<typeof imageRows>['beside']]>([
    [
      'a banner: the image beside its title and the text under it',
      [at('TitleBloc', '3/4'), at('ImageBloc', '1/4'), at('MarkdownBloc', '3/4')],
      [1, 2, 1],
      ['first-row', null, 'next-rows'],
    ],
    [
      'the image on the left of the rows',
      [at('ImageBloc', '1/3'), at('TitleBloc', '2/3'), at('MarkdownBloc', '1/3'), at('ButtonBloc', '1/3')],
      [2, 1, 1, 1],
      [null, 'first-row', 'next-rows', 'next-rows'],
    ],
    [
      'down to a row too wide to go beside it',
      [at('TitleBloc', '3/4'), at('ImageBloc', '1/4'), at('MarkdownBloc', '3/4'), at('MarkdownBloc')],
      [1, 2, 1, 1],
      ['first-row', null, 'next-rows', null],
    ],
    [
      'not when the next row does not fit beside it',
      [at('TitleBloc', '3/4'), at('ImageBloc', '1/4'), at('MarkdownBloc')],
      [1, 1, 1],
      [null, null, null],
    ],
    [
      'not for an image alone on its row',
      [at('ImageBloc', '1/4'), at('MarkdownBloc', '3/4')],
      [1, 1],
      [null, null],
    ],
    [
      'not for an image in the middle of its row',
      [at('TitleBloc', '1/4'), at('ImageBloc', '1/2'), at('ButtonBloc', '1/4'), at('MarkdownBloc', '1/4')],
      [1, 1, 1, 1],
      [null, null, null, null],
    ],
    [
      'not over a row holding another image',
      [at('TitleBloc', '3/4'), at('ImageBloc', '1/4'), at('ImageBloc', '1/2')],
      [1, 1, 1],
      [null, null, null],
    ],
  ])('%s', (_name, blocs, spans, beside) => {
    expect(imageRows(blocs)).toEqual({ spans, beside })
  })
})
