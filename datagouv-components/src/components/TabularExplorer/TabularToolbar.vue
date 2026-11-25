<template>
  <div class="flex items-center gap-2">
    <div class="flex min-w-0 flex-1 items-center gap-1.5">
      <TabularSearchInput v-if="searchInput" />
      <TabularMobileFilterButton class="md:hidden" />
    </div>
    <div class="flex shrink-0 items-center gap-4">
      <TabularColumnsMenu />
      <TabularRowsInfo />
    </div>
  </div>
</template>

<script setup lang="ts">
import TabularColumnsMenu from './TabularColumnsMenu.vue'
import TabularMobileFilterButton from './TabularMobileFilterButton.vue'
import TabularRowsInfo from './TabularRowsInfo.vue'
import TabularSearchInput from './TabularSearchInput.vue'
import { useTabularContext } from './useTabularContext'

// Framing (borders, padding, spacing) belongs to the call site: this toolbar sits in a
// bordered panel in the resource viewer and in the page flow on the standalone explore
// pages. Single root element, so the caller's `class` merges onto it.
// The active filters are not in here: they get a line of their own, placed by the
// call site under the toolbar (<TabularActiveFilters>).

const { searchInput } = useTabularContext()
</script>
