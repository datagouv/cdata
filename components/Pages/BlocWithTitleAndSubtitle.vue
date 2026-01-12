<template>
  <div class="space-y-6">
    <div class="space-y-2.5">
      <EditableText
        v-if="edit"
        v-model="bloc.title"
        class="text-gray-title text-3xl font-extrabold"
      />
      <div
        v-else-if="bloc.title"
        class="text-gray-title text-3xl font-extrabold"
      >
        {{ bloc.title }}
      </div>

      <EditableText
        v-if="edit && bloc.subtitle"
        v-model="bloc.subtitle"
        class="text-gray-plain"
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

    <slot />
  </div>
</template>

<script setup lang="ts">
import EditableText from './EditableText.vue'
import type { BlocWithTitle } from '~/types/pages'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<BlocWithTitle & { id: string }>({ required: true })
</script>
