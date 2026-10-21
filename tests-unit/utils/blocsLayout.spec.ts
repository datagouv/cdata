import { describe, expect, it } from 'vitest'
import { acceptsDropped, draggedClasses } from '~/utils/blocsLayout'
import type { Dragged } from '~/composables/useBlocsDrag'
import type { GridBloc, TitleBloc } from '~/types/pages'

const bloc = (...classes: Dragged['classes']): Dragged => ({ kind: 'bloc', classes })
const cell = (...classes: Dragged['classes']): Dragged => ({ kind: 'cell', classes })

// The same layout as udata's `check_blocs_layout` (see `PostBlocsLayoutAPITest`): what the
// editor lets through must save.
type Case = [name: string, level: Parameters<typeof acceptsDropped>[0], dragged: Dragged, inAccordion: boolean, accepted: boolean]

describe('acceptsDropped', () => {
  it.each<Case>([
    ['a title in a section', 'section', bloc('TitleBloc'), false, true],
    ['a grid in a section', 'section', bloc('GridBloc', 'MarkdownBloc'), false, true],
    ['an accordion in a section', 'section', bloc('AccordionListBloc'), false, true],
    ['a grid in a cell', 'cell', bloc('GridBloc', 'MarkdownBloc'), false, false],
    ['an accordion in a cell', 'cell', bloc('AccordionListBloc'), false, false],
    ['a grid in an accordion item', 'accordion', bloc('GridBloc', 'MarkdownBloc'), true, true],
    ['an accordion in an accordion item', 'accordion', bloc('AccordionListBloc'), true, false],
    ['the explorer in an accordion item', 'accordion', bloc('ExploreBloc'), true, false],
    ['the explorer in a cell of an accordion', 'cell', bloc('ExploreBloc'), true, false],
    ['the explorer among the cells of a grid of an accordion', 'grid', bloc('ExploreBloc'), true, false],
    ['the explorer in a cell of a section', 'cell', bloc('ExploreBloc'), false, true],
    ['a grid holding the explorer in an accordion item', 'accordion', bloc('GridBloc', 'ExploreBloc'), true, false],
    ['a cell leaving its blocs in a section', 'section', cell('TitleBloc', 'DatasetBloc'), false, true],
    ['a cell holding the explorer in an accordion item', 'accordion', cell('ExploreBloc'), true, false],
    ['a cell among the cells of a grid', 'grid', cell('TitleBloc'), false, true],
    ['a bloc among the cells of a grid', 'grid', bloc('ReuseBloc'), false, true],
    ['a grid among the cells of a grid', 'grid', bloc('GridBloc'), false, false],
    ['a section in a section', 'section', { kind: 'band', classes: ['SectionBloc'] }, false, false],
    ['an accordion item in a section', 'section', { kind: 'accordion-item', classes: [] }, false, false],
  ])('%s', (_name, level, dragged, inAccordion, accepted) => {
    expect(acceptsDropped(level, dragged, inAccordion)).toBe(accepted)
  })
})

describe('draggedClasses', () => {
  it('lists the blocs a grid holds', () => {
    const title: TitleBloc = { class: 'TitleBloc', id: 't', title: 'T', subtitle: null }
    const grid: GridBloc = {
      class: 'GridBloc',
      id: 'g',
      cells: [{ id: 'c', width: null, blocs: [{ class: 'ExploreBloc', id: 'e', resource_id: 'r' }] }],
    }
    expect(draggedClasses(title)).toEqual(['TitleBloc'])
    expect(draggedClasses(grid)).toEqual(['GridBloc', 'ExploreBloc'])
  })
})
