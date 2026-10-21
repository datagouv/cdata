<template>
  <!-- Inert while editing: a click aimed at the editor must not leave the page -->
  <ReuseCard
    v-if="bloc.reuse"
    class="min-w-0"
    :class="{ 'pointer-events-none select-none': edit }"
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
