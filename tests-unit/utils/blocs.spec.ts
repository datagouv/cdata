import { describe, expect, it } from 'vitest'
import { withoutEmptyBlocs } from '~/utils/blocs'
import type { AccordionListBloc, ImageBloc, LinksListBloc, MarkdownBloc, SectionBloc } from '~/types/pages'

describe('withoutEmptyBlocs', () => {
  const text: MarkdownBloc = { class: 'MarkdownBloc', id: 'text', width: null, content: 'Texte' }
  const noLinks: LinksListBloc = { class: 'LinksListBloc', id: 'links', width: null, links: [] }
  const noImage: ImageBloc = { class: 'ImageBloc', id: 'image', width: '1/3', image: '', alt: null }

  it('drops the accordions without items, the links without a link and the images not uploaded, then the sections left empty', () => {
    const sections: Array<SectionBloc> = [
      { class: 'SectionBloc', id: 'empty-accordion', color: 'green', blocs: [{ class: 'AccordionListBloc', id: 'accordion', width: null, items: [] }] },
      { class: 'SectionBloc', id: 'empty-links', color: null, blocs: [noLinks] },
      { class: 'SectionBloc', id: 'empty-image', color: null, blocs: [noImage] },
      { class: 'SectionBloc', id: 'kept', color: null, blocs: [noLinks, noImage, text] },
    ]

    expect(withoutEmptyBlocs(sections)).toEqual([{ class: 'SectionBloc', id: 'kept', color: null, blocs: [text] }])
  })

  it('drops the empty blocs of the accordion items, keeping the items and their titles', () => {
    const accordion: AccordionListBloc = { class: 'AccordionListBloc', id: 'accordion', width: null, items: [{ id: 'item', title: 'Item', content: [noLinks] }] }

    expect(withoutEmptyBlocs([{ class: 'SectionBloc', id: 'section', color: null, blocs: [accordion] }])).toEqual([
      { class: 'SectionBloc', id: 'section', color: null, blocs: [{ ...accordion, items: [{ id: 'item', title: 'Item', content: [] }] }] },
    ])
  })
})
