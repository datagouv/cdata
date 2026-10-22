import type { Component } from 'vue'
import { RiCursorLine, RiDatabase2Line, RiHeading, RiLayoutRowLine, RiLineChartLine, RiLink, RiListCheck2, RiMarkdownLine, RiTerminalLine } from '@remixicon/vue'
import { v4 as uuidv4 } from 'uuid'
import type { AccordionListBloc, BlocWidth, ButtonBloc, LinksListBloc, MarkdownBloc, ObjectBloc, SectionBloc, TitleBloc } from '~/types/pages'
import type { BlocClass } from '~/utils/blocsLayout'
import TitleBlocComponent from '~/components/Pages/TitleBloc.vue'
import MarkdownBlocComponent from '~/components/Pages/MarkdownBloc.vue'
import LinksListBlocComponent from '~/components/Pages/LinksListBloc.vue'
import ButtonBlocComponent from '~/components/Pages/ButtonBloc.vue'
import DatasetBlocComponent from '~/components/Pages/DatasetBloc.vue'
import DataserviceBlocComponent from '~/components/Pages/DataserviceBloc.vue'
import ReuseBlocComponent from '~/components/Pages/ReuseBloc.vue'
import AccordionBlocEditorComponent from '~/components/Pages/AccordionBlocEditor.vue'

// Components rendering the blocs nested in a section or an accordion item.
// Sections are rendered by `EditoBlocs` itself.
export const BLOC_COMPONENTS: Record<string, Component> = {
  TitleBloc: TitleBlocComponent,
  MarkdownBloc: MarkdownBlocComponent,
  LinksListBloc: LinksListBlocComponent,
  ButtonBloc: ButtonBlocComponent,
  DatasetBloc: DatasetBlocComponent,
  DataserviceBloc: DataserviceBlocComponent,
  ReuseBloc: ReuseBlocComponent,
  AccordionListBloc: AccordionBlocEditorComponent,
}

// Width of an object bloc once picked: reuses fit three per row, the others two.
export const OBJECT_WIDTH: Record<ObjectBloc['class'], BlocWidth> = {
  DatasetBloc: '1/2',
  DataserviceBloc: '1/2',
  ReuseBloc: '1/3',
}

// Name of a bloc in the editor, on the tab shown when it is hovered.
export function useBlocLabels(): Record<string, string> {
  const { t } = useTranslation()
  return {
    SectionBloc: t('Section'),
    ButtonBloc: t('Bouton'),
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

// A choice of the "add" menu, by the class of the bloc it adds.
export type BlocChoice = {
  icon: Component
  name: string
  description: string
} & (
  | { key: Exclude<BlocClass, ObjectBloc['class']>, create: () => SectionBloc | TitleBloc | MarkdownBloc | LinksListBloc | ButtonBloc | AccordionListBloc }
  // Objects are picked in a selector before their blocs can be built.
  | { key: ObjectBloc['class'] }
)

export function useBlocChoices() {
  const { t } = useTranslation()

  return {
    SectionBloc: {
      key: 'SectionBloc',
      icon: RiLayoutRowLine,
      name: t('Section'),
      description: t('Bande pleine largeur qui regroupe des blocs'),
      create: (): SectionBloc => ({ class: 'SectionBloc', id: uuidv4(), color: null, blocs: [] }),
    },
    TitleBloc: {
      key: 'TitleBloc',
      icon: RiHeading,
      name: t('Titre'),
      description: t('Titre et sous-titre'),
      create: (): TitleBloc => ({ class: 'TitleBloc', id: uuidv4(), width: null, title: t('Titre'), subtitle: null }),
    },
    MarkdownBloc: {
      key: 'MarkdownBloc',
      icon: RiMarkdownLine,
      name: t('Texte'),
      description: t('Ajouter du contenu texte riche'),
      create: (): MarkdownBloc => ({ class: 'MarkdownBloc', id: uuidv4(), width: null, content: '' }),
    },
    LinksListBloc: {
      key: 'LinksListBloc',
      icon: RiLink,
      name: t('Liens'),
      description: t('Mettre en avant quelques liens'),
      create: (): LinksListBloc => ({ class: 'LinksListBloc', id: uuidv4(), width: null, links: [] }),
    },
    ButtonBloc: {
      key: 'ButtonBloc',
      icon: RiCursorLine,
      name: t('Bouton'),
      description: t('Un lien mis en avant par un bouton'),
      // Saved as soon as added: its URL is required, the home page of the site until changed.
      create: (): ButtonBloc => ({ class: 'ButtonBloc', id: uuidv4(), width: null, title: t('Titre du bouton'), url: '/' }),
    },
    AccordionListBloc: {
      key: 'AccordionListBloc',
      icon: RiListCheck2,
      name: t('Accordéon'),
      description: t('Liste dépliable de contenus (FAQ, etc.)'),
      create: (): AccordionListBloc => ({ class: 'AccordionListBloc', id: uuidv4(), width: null, items: [] }),
    },
    DatasetBloc: {
      key: 'DatasetBloc',
      icon: RiDatabase2Line,
      name: t('Jeux de données'),
      description: t('Mettre en avant des jeux de données'),
    },
    DataserviceBloc: {
      key: 'DataserviceBloc',
      icon: RiTerminalLine,
      name: t('API'),
      description: t('Mettre en avant des API'),
    },
    ReuseBloc: {
      key: 'ReuseBloc',
      icon: RiLineChartLine,
      name: t('Réutilisations'),
      description: t('Mettre en avant des réutilisations'),
    },
  } satisfies Record<string, BlocChoice>
}
