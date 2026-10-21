<template>
  <div class="space-y-2.5 max-w-4xl">
    <!-- A title is required: emptying it keeps the previous one, the bloc is deleted instead. -->
    <EditableText
      v-if="edit"
      :model-value="bloc.title"
      class="text-gray-title text-3xl font-extrabold"
      :placeholder="$t('Titre')"
      @update:model-value="bloc.title = $event.trim() || bloc.title"
    />
    <h2
      v-else
      class="text-gray-title text-3xl font-extrabold mb-0"
    >
      {{ bloc.title }}
    </h2>

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

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<TitleBloc>({ required: true })
</script>
