<template>
  <div :class="fullscreen ? 'flex min-h-0 flex-1 flex-col' : ''">
    <!-- Header — mirrors ResourceExplorerViewer's header. The title/icon are already
         known, so keep them real (no pulse); only the fetched metadata is a placeholder. -->
    <div class="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-gray-default bg-gray-some px-3">
      <div class="flex min-w-0 items-center gap-1.5 text-[13px] text-gray-medium">
        <ResourceIcon
          :resource
          class="size-4 shrink-0"
        />
        <span class="min-w-0 truncate font-medium text-gray-title">{{ resource.title || t('Fichier sans nom') }}</span>
        <div class="animate-pulse-placeholder flex shrink-0 items-center gap-1.5">
          <span>·</span>
          <div class="h-3 w-28 rounded bg-gray-200" />
          <span>·</span>
          <div class="h-3 w-12 rounded bg-gray-200" />
          <span>·</span>
          <div class="h-4 w-9 rounded bg-gray-200" />
          <span>·</span>
          <div class="h-3 w-8 rounded bg-gray-200" />
        </div>
      </div>
      <div
        v-if="!fullscreen"
        class="animate-pulse-placeholder flex shrink-0 items-center gap-2"
      >
        <div class="h-8 w-28 rounded bg-gray-200" />
        <div class="size-8 rounded bg-gray-200" />
      </div>
    </div>

    <!-- Tabs row — each Tab (size sm) is 24px line-height + 8px vertical padding = 32px,
         inside a p-2 row, so the pills are h-8 to keep the row at the real height. -->
    <div class="animate-pulse-placeholder flex shrink-0 items-center gap-1 border-b border-gray-default p-2">
      <div class="h-8 w-16 rounded bg-gray-200" />
      <div class="h-8 w-14 rounded bg-gray-200" />
      <div class="h-8 w-28 rounded bg-gray-200" />
      <div class="h-8 w-40 rounded bg-gray-200" />
      <div class="h-8 w-24 rounded bg-gray-200" />
      <div class="h-8 w-12 rounded bg-gray-200" />
    </div>

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
      :class="fullscreen ? 'min-h-0 flex-1' : 'max-h-[70vh]'"
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
  </div>
</template>

<script setup lang="ts">
import ResourceIcon from '../ResourceAccordion/ResourceIcon.vue'
import { useTranslation } from '../../composables/useTranslation'
import type { Resource } from '../../types/resources'

defineProps<{
  resource: Resource
  fullscreen?: boolean
}>()

const { t } = useTranslation()
</script>
