<template>
  <div
    class="py-16"
    :class="heroBgColor(bloc.color)"
  >
    <div class="container space-y-5">
      <EditableText
        v-if="edit"
        v-model="bloc.title"
        class="text-white font-extrabold text-5xl mb-0"
      />
      <h1
        v-else
        class="text-white font-extrabold text-5xl mb-0"
      >
        {{ bloc.title }}
      </h1>

      <EditableText
        v-if="edit && bloc.description"
        :model-value="bloc.description ?? ''"
        class="italic font-spectral text-2xl text-white mb-0"
        @update:model-value="bloc.description = $event"
      />
      <p
        v-else-if="bloc.description"
        class="italic font-spectral text-2xl text-white mb-0"
      >
        {{ bloc.description }}
      </p>
      <button
        v-else-if="edit"
        class="text-white/70 hover:text-white text-sm"
        @click="bloc.description = $t('Description')"
      >
        + {{ $t('Ajouter une description') }}
      </button>

      <BrandedButtonEditor
        v-model:title="bloc.main_link_title"
        v-model:href="bloc.main_link_url"
        :edit
        color="secondary"
        class="pt-4"
        @clear="bloc.main_link_title = null; bloc.main_link_url = null"
      />

      <div
        v-if="edit"
        class="flex items-center gap-2 pt-4"
      >
        <span class="text-white text-sm">{{ $t('Couleur') }} :</span>
        <button
          v-for="color in heroColors"
          :key="color.value"
          type="button"
          class="size-8 rounded-full border-2 transition-transform"
          :class="[
            heroBgColor(color.value),
            bloc.color === color.value ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100',
          ]"
          :title="color.label"
          @click="bloc.color = color.value"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EditableText from './EditableText.vue'
import BrandedButtonEditor from './BrandedButtonEditor.vue'
import type { HeroBloc } from '~/types/pages'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<HeroBloc>({ required: true })

const { t } = useTranslation()

const heroColors = [
  { label: t('Bleu'), value: 'primary' as const },
  { label: t('Vert'), value: 'green' as const },
  { label: t('Violet'), value: 'purple' as const },
]

function heroBgColor(color: 'primary' | 'green' | 'purple') {
  return {
    primary: 'bg-new-blue-illustration',
    green: 'bg-new-green-illustration',
    purple: 'bg-new-brown-illustration',
  }[color]
}
</script>
