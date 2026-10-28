<template>
  <!-- Its blocs stacked in its share of the row, laid out as those of a section. While
       editing, framed with room inside: the gaps around a column are those of the section,
       whose inserters and handles they hold; the column's own ones go in that room, as those of
       an accordion item go under its title. -->
  <div :class="{ 'py-6 px-(--grid-gap) rounded-lg border border-dashed border-gray-300': edit }">
    <BlocsList
      v-model="bloc.blocs"
      :edit
      level="column"
    />
  </div>
</template>

<script setup lang="ts">
import BlocsList from './BlocsList.vue'
import type { ColumnBloc } from '~/types/pages'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<ColumnBloc>({ required: true })
</script>
