<template>
  <!-- Toolbar row — the active-filters area (left) is empty until the user filters,
       so on load only the columns menu (h-6 button) and rows info sit on the right;
       the columns button drives the row height. -->
  <div class="animate-pulse-placeholder flex shrink-0 items-center justify-end gap-4 border-b border-gray-default p-2">
    <div class="h-6 w-24 rounded bg-gray-200" />
    <div class="h-5 w-24 rounded bg-gray-200" />
  </div>

  <!-- Table — mirrors TabularTable: tall header cells (name + type line) then rows -->
  <div
    class="animate-pulse-placeholder overflow-hidden"
    :class="fill ? 'min-h-0 flex-1' : 'max-h-[70vh]'"
    role="status"
    :aria-label="t('Chargement de l\'aperçu…')"
  >
    <table class="w-full table-fixed text-sm border-collapse">
      <thead class="shadow-[inset_0_-1px_0_0_#E5E5E5]">
        <tr class="border-b border-gray-default">
          <th
            v-for="i in 6"
            :key="i"
            class="h-14 px-2 text-left align-middle border-r border-gray-default last:border-r-0"
          >
            <div class="mb-1.5 h-4 w-24 rounded bg-gray-200" />
            <div class="h-3 w-16 rounded bg-gray-200" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in 16"
          :key="row"
          class="h-10 border-b border-gray-default even:bg-gray-lowest-2"
        >
          <td
            v-for="col in 6"
            :key="col"
            class="px-2 align-middle border-r border-gray-default last:border-r-0"
          >
            <div class="h-3.5 w-3/4 rounded bg-gray-200" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/useTranslation'

defineProps<{
  // Fill the available height (fullscreen) instead of the default capped height.
  fill?: boolean
}>()

const { t } = useTranslation()
</script>
