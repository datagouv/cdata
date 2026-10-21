<template>
  <DataserviceCard
    v-if="bloc.dataservice"
    class="min-w-0"
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
