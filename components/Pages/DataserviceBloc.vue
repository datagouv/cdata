<template>
  <!-- Inert while editing: a click aimed at the editor must not leave the page -->
  <DataserviceCard
    v-if="bloc.dataservice"
    class="min-w-0"
    :class="{ 'pointer-events-none select-none': edit }"
    :dataservice="bloc.dataservice"
  />
  <MissingObjectBloc
    v-else-if="edit"
    :label="$t('Cette API n\'existe plus')"
  />
</template>

<script setup lang="ts">
import { DataserviceCard } from '@datagouv/components-next'
import MissingObjectBloc from './MissingObjectBloc.vue'
import type { DataserviceBloc } from '~/types/pages'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<DataserviceBloc>({ required: true })
</script>
