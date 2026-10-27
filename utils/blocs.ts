import type { InjectionKey, Ref } from 'vue'
import type { SectionBloc, SectionColor, SectionContentBloc } from '~/types/pages'

// Colour of the main buttons of the page (green on /reuses, brown on /dataservices), provided
// by `EditoBlocs` to the blocs however deep they are nested.
export type BlocsMainColor = 'primary' | 'brown-illustration' | 'green-illustration'
export const BLOCS_MAIN_COLOR: InjectionKey<BlocsMainColor> = Symbol('blocsMainColor')

// Background of the section holding a bloc, provided by `BlocsList`: on a colored one, the
// blocs are drawn in white.
export const SECTION_COLOR: InjectionKey<Ref<SectionColor | null>> = Symbol('sectionColor')

// The title bloc that is the title of the page (`h1`), provided by `EditoBlocs`: the first
// one, when the page has no title of its own.
export const PAGE_TITLE_ID: InjectionKey<Ref<string | null>> = Symbol('pageTitleId')

// Whether search engines may follow the links leaving the site, provided by `EditoBlocs`. Only
// for blocs written by the team, which keep helping the sites they point to: links chosen by
// users must not pass on the site's search ranking, or they become worth spamming for.
export const FOLLOW_LINKS: InjectionKey<boolean> = Symbol('followLinks')

// The images being uploaded, provided by `EditoBlocs`: saving before they are done would save
// their blocs without them.
export const UPLOADS_IN_PROGRESS: InjectionKey<Ref<number>> = Symbol('uploadsInProgress')

// What only exists for the editor, where content is added to it, and that no reader would
// see: an accordion without items, links without a link, an image not uploaded yet, then the
// sections left empty.
export function withoutEmptyBlocs(sections: Array<SectionBloc>): Array<SectionBloc> {
  const isEmpty = (bloc: SectionContentBloc) => (bloc.class === 'AccordionListBloc' && !bloc.items.length)
    || (bloc.class === 'LinksListBloc' && !bloc.links.length)
    || (bloc.class === 'ImageBloc' && !bloc.image)
  const shown = <T extends SectionContentBloc>(blocs: Array<T>): Array<T> => blocs
    .filter(bloc => !isEmpty(bloc))
    .map(bloc => bloc.class === 'AccordionListBloc'
      ? { ...bloc, items: bloc.items.map(item => ({ ...item, content: shown(item.content) })) }
      : bloc)
  return sections
    .map(section => ({ ...section, blocs: shown(section.blocs) }))
    .filter(section => section.blocs.length)
}
