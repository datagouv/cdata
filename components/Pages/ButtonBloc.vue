<template>
  <div
    v-if="edit"
    class="space-y-2"
  >
    <div
      class="inline-flex items-center justify-center font-marianne font-medium border text-sm h-10 leading-none px-4 gap-x-1"
      :class="EDIT_COLORS[color] ?? EDIT_COLORS.primary"
    >
      <span
        contenteditable="true"
        role="textbox"
        class="outline-none min-w-[10ch] focus:ring-2 focus:ring-blue-300 rounded-sm"
        :aria-label="$t('Titre du bouton')"
        @blur="bloc.title = ($event.target as HTMLElement).textContent?.trim() || bloc.title"
      >{{ bloc.title }}</span>
    </div>
    <input
      v-model="bloc.url"
      type="text"
      class="block text-sm text-gray-title placeholder:text-gray-500 bg-white border rounded px-2 py-1 w-full max-w-xs"
      :placeholder="$t('URL du bouton')"
      :aria-label="$t('URL du bouton')"
    >
  </div>
  <BrandedButton
    v-else
    :href="bloc.url"
    :color
  >
    {{ bloc.title }}
  </BrandedButton>
</template>

<script setup lang="ts">
import type { ComponentProps } from 'vue-component-type-helpers'
import { BrandedButton } from '@datagouv/components-next'
import type { ButtonBloc } from '~/types/pages'
import { BLOCS_MAIN_COLOR, SECTION_COLOR } from '~/utils/blocs'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<ButtonBloc>({ required: true })

type Color = ComponentProps<typeof BrandedButton>['color']

// On a colored section, a white button, as the heroes had; elsewhere, the main color of the page.
const mainColor = inject(BLOCS_MAIN_COLOR, 'primary')
const sectionColor = inject(SECTION_COLOR, ref(null))
const color = computed<NonNullable<Color>>(() => sectionColor.value ? 'secondary' : mainColor ?? 'primary')

// The look of the `BrandedButton` of each color, while its title is edited in place.
const EDIT_COLORS: Partial<Record<NonNullable<Color>, string>> = {
  'primary': 'text-white bg-new-primary !border-new-primary',
  'secondary': 'text-new-gray-dark bg-white !border-new-gray-dark',
  'tertiary': 'text-gray-plain !border-transparent',
  'warning': 'text-new-warning bg-white !border-new-warning',
  'danger': '!text-new-error bg-white !border-new-error',
  'brown-illustration': '!border-none bg-new-brown-illustration text-white',
  'green-illustration': '!border-none bg-new-green-illustration text-white',
}
</script>
