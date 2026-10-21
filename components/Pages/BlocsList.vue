<template>
  <div>
    <div
      v-for="(bloc, index) in blocs"
      :key="bloc.id"
      class="relative"
      :class="[spacingBefore(index), { 'pt-10': edit }]"
      :data-testid="`bloc-${bloc.class}`"
    >
      <!-- Inside the bloc's own box, so it never covers a neighbouring cell or toolbar -->
      <div
        v-if="edit"
        class="absolute top-0 right-0 z-10 flex gap-1"
      >
        <BrandedButton
          color="tertiary"
          size="xs"
          :icon="RiArrowUpLine"
          :disabled="index === 0"
          :title="$t('Monter')"
          @click="move(index, -1)"
        />
        <BrandedButton
          color="tertiary"
          size="xs"
          :icon="RiArrowDownLine"
          :disabled="index === blocs.length - 1"
          :title="$t('Descendre')"
          @click="move(index, 1)"
        />
        <BrandedButton
          color="tertiary"
          size="xs"
          :icon="RiDeleteBinLine"
          :title="$t('Supprimer')"
          @click="blocs.splice(index, 1)"
        />
      </div>

      <component
        :is="BLOC_COMPONENTS[bloc.class]"
        v-if="BLOC_COMPONENTS[bloc.class]"
        v-model="(blocs[index] as any)"
        :edit
      />
      <MissingObjectBloc
        v-else-if="edit"
        :label="$t('Ce bloc ne peut pas être affiché ici')"
      />
    </div>

    <div
      v-if="edit"
      class="flex justify-center"
      :class="{ 'mt-6': blocs.length }"
    >
      <AddBlocDropdown
        :level
        @new-blocs="blocs.push(...($event as Array<T>))"
      >
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm"
          :data-testid="`add-bloc-in-${level}`"
        >
          <RiAddLine class="size-4" />
          {{ $t('Ajouter un bloc') }}
        </button>
      </AddBlocDropdown>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends SectionContentBloc">
import * as Sentry from '@sentry/nuxt'
import { BrandedButton } from '@datagouv/components-next'
import { RiAddLine, RiArrowDownLine, RiArrowUpLine, RiDeleteBinLine } from '@remixicon/vue'
import AddBlocDropdown from './AddBlocDropdown.vue'
import MissingObjectBloc from './MissingObjectBloc.vue'
import type { SectionContentBloc } from '~/types/pages'
import { BLOC_COMPONENTS, type BlocsLevel } from '~/utils/pages'

const props = defineProps<{
  edit: boolean
  // Restricts the blocs offered in the "add" menu, see `AddBlocDropdown`.
  level: Exclude<BlocsLevel, 'page'>
}>()

const blocs = defineModel<Array<T>>({ required: true })

watchEffect(() => {
  for (const bloc of blocs.value) {
    if (!BLOC_COMPONENTS[bloc.class]) {
      Sentry.captureMessage(`Unknown bloc type: "${bloc.class}"`, 'warning')
    }
  }
})

// A title stays close to what it introduces; other blocs are further apart.
function spacingBefore(index: number) {
  if (index === 0) return ''
  const afterTitle = blocs.value[index - 1].class === 'TitleBloc'
  if (props.level === 'cell') return afterTitle ? 'mt-4' : 'mt-6'
  return afterTitle ? 'mt-6' : 'mt-12'
}

function move(index: number, direction: -1 | 1) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= blocs.value.length) return
  const moved = blocs.value.splice(index, 1)[0]
  blocs.value.splice(newIndex, 0, moved)
}
</script>
