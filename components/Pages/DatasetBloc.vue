<template>
  <!-- Inert while editing: a click aimed at the editor must not leave the page -->
  <DatasetCardLg
    v-if="bloc.dataset"
    class="min-w-0"
    :class="{ 'pointer-events-none select-none': edit }"
    :dataset="bloc.dataset"
  />
  <MissingObjectBloc
    v-else-if="edit"
    :label="$t('Ce jeu de données n\'existe plus')"
  />
</template>

<script setup lang="ts">
import MissingObjectBloc from './MissingObjectBloc.vue'
import type { DatasetBloc } from '~/types/pages'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<DatasetBloc>({ required: true })
</script>
