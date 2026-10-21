<template>
  <!-- Inert while editing: a click aimed at the editor must not leave the page -->
  <ReuseCard
    class="min-w-0"
    :class="{ 'pointer-events-none select-none': edit }"
    :reuse="bloc.reuse"
  />
</template>

<script setup lang="ts">
import { ReuseCard } from '@datagouv/components-next'
import type { ReuseBloc } from '~/types/pages'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<ReuseBloc>({ required: true })
</script>
