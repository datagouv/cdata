<template>
  <div class="space-y-2.5 max-w-4xl">
    <!-- A title is required: emptying it keeps the previous one, the bloc is deleted instead. -->
    <EditableText
      v-if="edit"
      :model-value="bloc.title"
      class="text-gray-title"
      :class="heading.class"
      :placeholder="$t('Titre')"
      @update:model-value="bloc.title = $event.trim() || bloc.title"
    />
    <component
      :is="heading.tag"
      v-else
      class="text-gray-title mb-0"
      :class="heading.class"
    >
      {{ bloc.title }}
    </component>

    <EditableText
      v-if="edit && bloc.subtitle"
      :model-value="bloc.subtitle"
      class="text-gray-plain"
      @update:model-value="bloc.subtitle = $event || null"
    />
    <div
      v-else-if="bloc.subtitle"
      class="text-gray-plain"
    >
      {{ bloc.subtitle }}
    </div>
    <button
      v-else-if="edit"
      type="button"
      class="text-gray-400 hover:text-gray-600 text-sm"
      @click="bloc.subtitle = $t('Sous-titre')"
    >
      + {{ $t('Ajouter un sous-titre') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import EditableText from './EditableText.vue'
import type { TitleBloc } from '~/types/pages'
import { BLOCS_LEVEL, type BlocsLevel } from '~/utils/blocsLayout'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<TitleBloc>({ required: true })

// The title of a section, or of the content of an accordion item, whose own title is an `h3`.
const HEADINGS: Record<Exclude<BlocsLevel, 'page'>, { tag: string, class: string }> = {
  section: { tag: 'h2', class: 'text-3xl font-extrabold' },
  accordion: { tag: 'h4', class: 'text-lg font-bold' },
}
const heading = HEADINGS[inject(BLOCS_LEVEL, 'section')]
</script>
