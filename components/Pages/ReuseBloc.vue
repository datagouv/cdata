<template>
  <ReuseCard
    v-if="bloc.reuse"
    class="min-w-0"
    :reuse="bloc.reuse"
  />
  <MissingObjectBloc
    v-else-if="edit"
    :label="$t('Cette réutilisation n\'existe plus')"
  />
</template>

<script setup lang="ts">
import { ReuseCard } from '@datagouv/components-next'
import MissingObjectBloc from './MissingObjectBloc.vue'
import type { ReuseBloc } from '~/types/pages'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<ReuseBloc>({ required: true })
</script>
