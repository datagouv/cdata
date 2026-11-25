<template>
  <!-- Inert while editing: a click aimed at the editor must not leave the page -->
  <DatasetCardLg
    class="min-w-0"
    :class="{ 'pointer-events-none select-none': edit }"
    :dataset="bloc.dataset"
  />
</template>

<script setup lang="ts">
import type { DatasetBloc } from '~/types/pages'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<DatasetBloc>({ required: true })
</script>
