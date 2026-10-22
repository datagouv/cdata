import { describe, expect, it } from 'vitest'
import { normalizeBlocs, type LegacyBloc } from '~/utils/blocs'
import type { DatasetV2, Dataservice, Reuse } from '@datagouv/components-next'
import type { AccordionListBloc, PageBloc, SectionBloc } from '~/types/pages'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/

const dataset = (id: string) => ({ id, title: `Dataset ${id}` }) as DatasetV2
const dataservice = (id: string) => ({ id, title: `API ${id}` }) as Dataservice
const reuse = (id: string) => ({ id, title: `Reuse ${id}` }) as Reuse

const hero: LegacyBloc = { class: 'HeroBloc', id: 'hero', title: 'Hero', description: 'Description', color: 'green', main_link_title: 'Go', main_link_url: 'https://example.com' }

function sectionOf(blocs: Array<PageBloc>, index: number): SectionBloc {
  const bloc = blocs[index]
  if (bloc?.class !== 'SectionBloc') throw new Error(`bloc ${index} is not a section`)
  return bloc
}

describe('normalizeBlocs', () => {
  it('wraps every legacy bloc in its own section', () => {
    const blocs = normalizeBlocs([
      { class: 'MarkdownBloc', id: 'md-1', title: null, subtitle: null, content: 'Un' },
      { class: 'MarkdownBloc', id: 'md-2', title: null, subtitle: null, content: 'Deux' },
    ])

    expect(blocs.map(bloc => bloc.class)).toEqual(['SectionBloc', 'SectionBloc'])
    expect(sectionOf(blocs, 0).blocs).toEqual([{ class: 'MarkdownBloc', id: 'md-1', width: null, content: 'Un' }])
    expect(sectionOf(blocs, 1).blocs).toEqual([{ class: 'MarkdownBloc', id: 'md-2', width: null, content: 'Deux' }])
    expect(sectionOf(blocs, 0).id).toMatch(UUID)
  })

  it('turns a hero into a section of its color holding its title and its button', () => {
    expect(normalizeBlocs([hero])).toEqual([{
      class: 'SectionBloc',
      id: 'hero',
      color: 'green',
      blocs: [
        { class: 'TitleBloc', id: expect.stringMatching(UUID), width: null, title: 'Hero', subtitle: 'Description' },
        { class: 'ButtonBloc', id: expect.stringMatching(UUID), width: null, title: 'Go', url: 'https://example.com' },
      ],
    }])
  })

  it('gives a hero without color the primary one, and a neutral section where sections have no color', () => {
    const uncolored: LegacyBloc = { class: 'HeroBloc', id: 'hero', title: 'Hero', description: null, color: null, main_link_title: null, main_link_url: null }

    expect(sectionOf(normalizeBlocs([uncolored]), 0).color).toBe('primary')
    expect(sectionOf(normalizeBlocs([hero], false), 0).color).toBeNull()
  })

  it.each([
    ['with a paragraph, on its left with the button under it', 'P', [['MarkdownBloc', '1/2'], ['LinksListBloc', '1/2'], ['ButtonBloc', '1/2']]],
    ['without a paragraph, with the button under the links', null, [['LinksListBloc', null], ['ButtonBloc', null]]],
  ] as const)('splits a list of links %s', (_name, paragraph, blocs) => {
    const [section] = normalizeBlocs([
      { class: 'LinksListBloc', id: 'links', title: null, subtitle: null, paragraph, main_link_title: 'Go', main_link_url: 'https://example.com', links: [] },
    ])

    expect(section.blocs.map(bloc => [bloc.class, bloc.width])).toEqual(blocs)
  })

  it('extracts the title and subtitle of a bloc into a title bloc placed before it', () => {
    const [section] = normalizeBlocs([
      { class: 'MarkdownBloc', id: 'md', title: 'Titre', subtitle: 'Sous-titre', content: 'Texte' },
    ])

    expect((section as SectionBloc).blocs).toEqual([
      { class: 'TitleBloc', id: expect.stringMatching(UUID), width: null, title: 'Titre', subtitle: 'Sous-titre' },
      { class: 'MarkdownBloc', id: 'md', width: null, content: 'Texte' },
    ])
  })

  it('turns a subtitle without a title into a text bloc, a title bloc requiring a title', () => {
    const [section] = normalizeBlocs([
      { class: 'LinksListBloc', id: 'links', title: '  ', subtitle: 'Seulement un sous-titre', paragraph: null, main_link_title: null, main_link_url: null, links: [] },
    ])

    expect((section as SectionBloc).blocs).toEqual([
      { class: 'MarkdownBloc', id: expect.stringMatching(UUID), width: null, content: 'Seulement un sous-titre' },
      { class: 'LinksListBloc', id: 'links', width: null, links: [] },
    ])
  })

  it.each([
    ['DatasetsListBloc', { datasets: [dataset('a'), dataset('b')] }, 'DatasetBloc', 'dataset', '1/2'],
    ['DataservicesListBloc', { dataservices: [dataservice('a'), dataservice('b')] }, 'DataserviceBloc', 'dataservice', '1/2'],
    ['ReusesListBloc', { reuses: [reuse('a'), reuse('b')] }, 'ReuseBloc', 'reuse', '1/3'],
  ] as const)('turns a %s into one bloc per object, keeping the columns of the list', (legacyClass, objects, objectClass, objectKey, width) => {
    const legacy = { class: legacyClass, id: 'list', title: null, subtitle: null, ...objects } as unknown as LegacyBloc
    const [section] = normalizeBlocs([legacy])
    const sourceObjects: ReadonlyArray<unknown> = Object.values(objects)[0]

    expect((section as SectionBloc).blocs).toEqual(sourceObjects.map(object => (
      { class: objectClass, id: expect.stringMatching(UUID), width, [objectKey]: object }
    )))
  })

  it('keeps only the title of an empty object list', () => {
    const [section] = normalizeBlocs([{ class: 'DatasetsListBloc', id: 'list', title: 'À la une', subtitle: null, datasets: [] }])

    expect((section as SectionBloc).blocs).toEqual([
      { class: 'TitleBloc', id: expect.stringMatching(UUID), width: null, title: 'À la une', subtitle: null },
    ])
  })

  it('drops an empty object list without a title: a section is never empty', () => {
    expect(normalizeBlocs([{ class: 'DatasetsListBloc', id: 'list', title: null, subtitle: null, datasets: [] }])).toEqual([])
  })

  it('converts the content of accordion items and moves the accordion title and description to a title bloc', () => {
    const [section] = normalizeBlocs([{
      class: 'AccordionListBloc',
      id: 'accordion',
      title: 'FAQ',
      description: 'Questions fréquentes',
      items: [{
        title: 'Question',
        content: [
          { class: 'MarkdownBloc', id: 'md', title: 'Réponse', subtitle: null, content: 'Texte' },
          { class: 'DatasetsListBloc', id: 'list', title: null, subtitle: null, datasets: [dataset('a')] },
        ],
      }],
    }])
    const [title, accordion] = (section as SectionBloc).blocs

    expect(title).toEqual({ class: 'TitleBloc', id: expect.stringMatching(UUID), width: null, title: 'FAQ', subtitle: 'Questions fréquentes' })
    expect(accordion).toMatchObject({ class: 'AccordionListBloc', id: 'accordion' })
    expect(accordion).not.toHaveProperty('title')
    expect(accordion).not.toHaveProperty('description')
    const [item] = (accordion as AccordionListBloc).items
    expect(item.title).toBe('Question')
    expect(item.content.map(bloc => bloc.class)).toEqual(['TitleBloc', 'MarkdownBloc', 'DatasetBloc'])
  })

  it('turns a hero in an accordion item into its title and its button', () => {
    const [section] = normalizeBlocs([{ class: 'AccordionListBloc', id: 'accordion', items: [{ title: 'Item', content: [hero] }] }])
    const [item] = ((section as SectionBloc).blocs[0] as AccordionListBloc).items

    expect(item.content).toEqual([
      { class: 'TitleBloc', id: expect.stringMatching(UUID), width: null, title: 'Hero', subtitle: 'Description' },
      { class: 'ButtonBloc', id: expect.stringMatching(UUID), width: null, title: 'Go', url: 'https://example.com' },
    ])
  })

  it('leaves blocs already in the section format untouched', () => {
    const blocs: Array<PageBloc> = [
      { class: 'SectionBloc', id: 'colored', color: 'green', blocs: [] },
      { class: 'SectionBloc', id: 'section', color: null, blocs: [{ class: 'TitleBloc', id: 'title', width: null, title: 'Titre', subtitle: null }] },
    ]

    expect(normalizeBlocs(blocs)).toEqual(blocs)
    expect(normalizeBlocs(normalizeBlocs(blocs))).toEqual(blocs)
  })

  it('derives the same ids from the same blocs, so server and client render alike', () => {
    const legacy: Array<LegacyBloc> = [{ class: 'DatasetsListBloc', id: 'list', title: 'Titre', subtitle: null, datasets: [dataset('a'), dataset('b')] }]

    expect(normalizeBlocs(legacy)).toEqual(normalizeBlocs(legacy))
    const ids = JSON.stringify(normalizeBlocs(legacy)).match(/[0-9a-f]{8}-[0-9a-f-]{27}/g) ?? []
    expect(new Set(ids).size).toBe(ids.length)
  })
})
