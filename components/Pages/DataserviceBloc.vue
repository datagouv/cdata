<template>
  <!-- Inert while editing: a click aimed at the editor must not leave the page -->
  <DataserviceCard
    class="min-w-0"
    :class="{ 'pointer-events-none select-none': edit }"
    :dataservice="bloc.dataservice"
  />
</template>

<script setup lang="ts">
import { DataserviceCard } from '@datagouv/components-next'
import type { DataserviceBloc } from '~/types/pages'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<DataserviceBloc>({ required: true })
</script>
