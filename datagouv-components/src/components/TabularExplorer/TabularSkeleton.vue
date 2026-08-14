<template>
  <!-- Toolbar row — mirrors TabularToolbar: the mobile filter button on the left (it
       only shows below md), and the columns menu (h-6 button, which drives the row
       height) plus the rows info on the right. The active-filters area stays empty
       until the user filters, so nothing stands in for it. -->
  <div class="animate-pulse-placeholder flex shrink-0 items-center gap-2 border-b border-gray-default p-2">
    <div class="h-6 w-24 rounded bg-gray-200 md:hidden" />
    <div class="flex flex-1 items-center justify-end gap-4">
      <div class="h-6 w-24 rounded bg-gray-200" />
      <div class="h-5 w-24 rounded bg-gray-200" />
    </div>
  </div>

  <!-- Table — mirrors TabularTable: tall header cells (name + type line) then rows.
       Desktop only, like the real one. -->
  <div
    class="animate-pulse-placeholder hidden overflow-hidden md:block"
    :class="fill ? 'min-h-0 flex-1' : 'max-h-[70vh]'"
    role="status"
    :aria-label="t('Chargement de l\'aperçu…')"
  >
    <table class="w-full table-fixed text-sm border-collapse">
      <thead class="bg-gray-some shadow-[inset_0_-1px_0_0_#E5E5E5]">
        <tr class="border-b border-gray-default">
          <th
            v-for="i in 6"
            :key="i"
            class="h-12 px-3 text-left align-middle border-r border-gray-default last:border-r-0"
          >
            <div class="flex items-center justify-between gap-1">
              <div class="flex items-center gap-1">
                <div class="size-4 shrink-0 rounded bg-gray-200" />
                <div class="h-3.5 w-20 rounded bg-gray-200" />
              </div>
              <div class="size-4 shrink-0 rounded bg-gray-200" />
            </div>
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

  <!-- Mobile — the real table becomes a list of cards below md, each showing four
       fields until it is expanded. -->
  <div
    class="animate-pulse-placeholder space-y-2 px-1 md:hidden"
    role="status"
    :aria-label="t('Chargement de l\'aperçu…')"
  >
    <div
      v-for="card in 4"
      :key="card"
      class="space-y-2 rounded-lg border border-gray-default p-3"
      :class="card % 2 === 0 ? 'bg-gray-lowest-2' : 'bg-white'"
    >
      <div
        v-for="field in 4"
        :key="field"
        class="flex flex-col gap-0.5"
      >
        <div class="h-3 w-24 rounded bg-gray-200" />
        <div class="h-4 w-2/3 rounded bg-gray-200" />
      </div>
    </div>
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
