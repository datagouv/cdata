<template>
  <div
    v-if="edit"
    class="space-y-2"
  >
    <div
      class="inline-flex items-center justify-center font-marianne font-medium border text-sm h-10 leading-none px-4 gap-x-1"
      :class="EDIT_COLORS[color]"
    >
      <!-- A title and a URL are required: emptying one keeps the previous one, the bloc is
           deleted instead. -->
      <EditableText
        :model-value="bloc.title"
        tag="span"
        class="min-w-[10ch]"
        :aria-label="$t('Titre du bouton')"
        @update:model-value="bloc.title = $event.trim() || bloc.title"
      />
    </div>
    <BlocUrlInput
      v-model="bloc.url"
      :label="$t('URL du bouton')"
      class="max-w-xs"
    />
  </div>
  <BrandedButton
    v-else
    :href="bloc.url"
    :rel="followLinks ? undefined : 'ugc nofollow noopener'"
    :color
  >
    {{ bloc.title }}
  </BrandedButton>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import BlocUrlInput from './BlocUrlInput.vue'
import EditableText from './EditableText.vue'
import type { ButtonBloc } from '~/types/pages'
import { BLOCS_MAIN_COLOR, FOLLOW_LINKS, SECTION_COLOR, type BlocsMainColor } from '~/utils/blocs'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<ButtonBloc>({ required: true })

// White on a colored section, elsewhere the main color of the page.
type Color = BlocsMainColor | 'secondary'

const mainColor = inject(BLOCS_MAIN_COLOR, 'primary')
const sectionColor = inject(SECTION_COLOR, ref(null))
const color = computed<Color>(() => sectionColor.value ? 'secondary' : mainColor)

// Link chosen by whoever wrote the bloc, see `FOLLOW_LINKS`.
const followLinks = inject(FOLLOW_LINKS, false)

// The look of the `BrandedButton` of each color, while its title is edited in place.
const EDIT_COLORS: Record<Color, string> = {
  'primary': 'text-white bg-new-primary !border-new-primary',
  'secondary': 'text-new-gray-dark bg-white !border-new-gray-dark',
  'brown-illustration': '!border-none bg-new-brown-illustration text-white',
  'green-illustration': '!border-none bg-new-green-illustration text-white',
}
</script>
