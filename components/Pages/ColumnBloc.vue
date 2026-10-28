<template>
  <!-- Its blocs stacked in its share of the row, laid out as those of a section -->
  <BlocsList
    v-model="bloc.blocs"
    :edit
    level="column"
  />
</template>

<script setup lang="ts">
import BlocsList from './BlocsList.vue'
import type { ColumnBloc } from '~/types/pages'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<ColumnBloc>({ required: true })
</script>
