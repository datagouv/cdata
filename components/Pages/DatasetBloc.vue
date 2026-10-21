<template>
  <DatasetCardLg
    v-if="bloc.dataset"
    class="min-w-0"
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
