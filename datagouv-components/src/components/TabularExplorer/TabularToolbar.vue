<template>
  <div class="flex items-center gap-2">
    <div class="flex min-w-0 flex-1 items-center gap-1.5">
      <TabularMobileFilterButton class="md:hidden" />
      <div class="hidden md:block">
        <TabularActiveFilters with-clear />
      </div>
    </div>
    <div class="flex shrink-0 items-center gap-4">
      <TabularColumnsMenu />
      <TabularRowsInfo />
    </div>
  </div>
</template>

<script setup lang="ts">
import TabularActiveFilters from './TabularActiveFilters.vue'
import TabularColumnsMenu from './TabularColumnsMenu.vue'
import TabularMobileFilterButton from './TabularMobileFilterButton.vue'
import TabularRowsInfo from './TabularRowsInfo.vue'

// Framing (borders, padding, spacing) belongs to the call site: this toolbar sits in a
// bordered panel in the resource viewer and in the page flow on the standalone explore
// pages. Single root element, so the caller's `class` merges onto it.
</script>
