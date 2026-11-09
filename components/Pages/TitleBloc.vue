<template>
  <div
    class="space-y-2.5 max-w-4xl"
    :class="{ 'pb-6': isPageTitle && !sectionColor }"
  >
    <!-- A title is required: emptying it keeps the previous one, the bloc is deleted instead. -->
    <EditableText
      v-if="edit"
      :model-value="bloc.title"
      :class="style.title"
      :placeholder="$t('Titre')"
      @update:model-value="bloc.title = $event.trim() || bloc.title"
    />
    <!-- The id is rendered server-side so that the router finds the anchor of the URL on load -->
    <component
      :is="tag"
      v-else
      :id="slugify(bloc.title)"
      class="mb-0"
      :class="style.title"
    >
      {{ bloc.title }}
    </component>

    <EditableText
      v-if="edit && bloc.subtitle"
      :model-value="bloc.subtitle"
      :class="style.subtitle"
      @update:model-value="bloc.subtitle = $event || null"
    />
    <div
      v-else-if="bloc.subtitle"
      :class="style.subtitle"
    >
      {{ bloc.subtitle }}
    </div>
    <!-- Without the grey background the DSFR gives a hovered button: on a coloured section, it
         hid the white text. An editor control, hidden while dragging. -->
    <button
      v-else-if="edit"
      type="button"
      class="text-sm hover:!bg-transparent"
      :class="sectionColor ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-gray-600'"
      data-edit-control
      @click="bloc.subtitle = $t('Sous-titre')"
    >
      + {{ $t('Ajouter un sous-titre') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import EditableText from './EditableText.vue'
import type { TitleBloc } from '~/types/pages'
import { PAGE_TITLE_ID, SECTION_COLOR } from '~/utils/blocs'
import { HEADING_LEVEL, type HeadingLevel } from '~/utils/blocsLayout'
import { slugify } from '~/utils/headings'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<TitleBloc>({ required: true })

// The title of a section, or of the content of an accordion item, whose own title is an `h3`.
const HEADINGS: Record<HeadingLevel, { tag: string, class: string }> = {
  section: { tag: 'h2', class: 'text-3xl font-extrabold' },
  accordion: { tag: 'h4', class: 'text-lg font-bold' },
}
const level = inject(HEADING_LEVEL, 'section')
const heading = HEADINGS[level]

// The first title of a page without a title of its own is that of the page.
const pageTitleId = inject(PAGE_TITLE_ID, ref(null))
const isPageTitle = computed(() => pageTitleId.value === bloc.value.id)
const tag = computed(() => isPageTitle.value ? 'h1' : heading.tag)

// On a colored section, the title of the section is a banner: white, very large, its subtitle
// in italics, as the banners at the top of the datasets, reuses and API pages.
const sectionColor = inject(SECTION_COLOR, ref(null))
const style = computed(() => {
  if (sectionColor.value && level === 'section') {
    return { title: 'text-white font-extrabold text-5xl', subtitle: 'italic font-spectral text-2xl text-white' }
  }
  if (sectionColor.value) return { title: `text-white ${heading.class}`, subtitle: 'text-white' }
  // The title of the page outranks the titles of its sections, and those of its texts, which
  // have the size of a section title: that of the title of an article.
  if (isPageTitle.value) return { title: 'text-gray-title text-4.5xl font-extrabold', subtitle: 'text-gray-plain' }
  return { title: `text-gray-title ${heading.class}`, subtitle: 'text-gray-plain' }
})
</script>
