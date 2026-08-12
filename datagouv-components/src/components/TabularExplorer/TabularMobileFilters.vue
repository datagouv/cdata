<template>
  <TransitionRoot
    :show="mobileFilterOpen"
    as="template"
  >
    <Dialog
      class="relative z-[900]"
      @close="mobileFilterOpen = false"
    >
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30" />
      </TransitionChild>
      <!-- Panel -->
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="translate-y-full"
        enter-to="translate-y-0"
        leave="ease-in duration-200"
        leave-from="translate-y-0"
        leave-to="translate-y-full"
      >
        <div class="fixed inset-x-0 bottom-0 max-h-[80vh] flex flex-col bg-white rounded-t-2xl shadow-xl">
          <DialogPanel class="flex flex-col max-h-[80vh]">
            <div class="px-4 pt-4 pb-2 border-b border-gray-default">
              <DialogTitle class="text-sm font-bold">
                {{ t('Filtres & tri par colonne') }}
              </DialogTitle>
              <p class="text-xs text-gray-low">
                {{ allColumns.length }} {{ t('colonnes') }} · {{ activeFilters.length }} {{ t('filtre') }}{{ activeFilters.length !== 1 ? 's' : '' }}
              </p>
            </div>
            <!-- Column list -->
            <div class="flex-1 overflow-y-auto">
              <div
                v-for="col in allColumns"
                :key="col"
                class="border-b border-gray-default last:border-b-0"
              >
                <button
                  class="flex items-center gap-2 w-full px-3 py-2.5 text-left"
                  :class="hasFilterForColumn(col) ? 'bg-new-primary/5' : ''"
                  @click="toggleColumn(col)"
                >
                  <component
                    :is="getColumnDisplay(col).icon"
                    class="size-3.5 text-gray-low shrink-0"
                    aria-hidden="true"
                  />
                  <span class="flex-1 text-sm text-gray-title truncate">{{ col }}</span>
                  <RiArrowUpLine
                    v-if="sort?.column === col && sort.direction === 'asc'"
                    class="size-3 text-new-primary shrink-0"
                    aria-hidden="true"
                  />
                  <RiArrowDownLine
                    v-if="sort?.column === col && sort.direction === 'desc'"
                    class="size-3 text-new-primary shrink-0"
                    aria-hidden="true"
                  />
                  <span
                    v-if="hasFilterForColumn(col)"
                    class="size-2 rounded-full bg-new-primary shrink-0"
                  />
                  <RiArrowDownSLine
                    class="size-3.5 text-gray-low shrink-0 transition-transform"
                    :class="{ 'rotate-180': expandedCol === col }"
                    aria-hidden="true"
                  />
                </button>
                <div
                  v-if="expandedCol === col"
                  class="pb-1"
                >
                  <TabularFilterContent
                    v-model:sort="sort"
                    v-model:filters="filters"
                    :column="col"
                    :column-type="getColumnType(col)"
                    :column-profile="getColumnProfile(col)"
                    :null-percent="getNullPercent(col)"
                    :total-lines="totalLines"
                    :boolean-counts="getColumnType(col) === 'boolean' ? getBooleanCounts(col) : undefined"
                  />
                </div>
              </div>
            </div>
            <!-- Reset all -->
            <div
              v-if="activeFilters.length > 0 || sort"
              class="border-t border-gray-default px-4 py-3"
            >
              <BrandedButton
                color="secondary"
                size="xs"
                class="w-full"
                @click="clearAllFilters(); sort = null; mobileFilterOpen = false"
              >
                {{ t('Tout réinitialiser') }}
              </BrandedButton>
            </div>
          </DialogPanel>
        </div>
      </TransitionChild>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { RiArrowDownLine, RiArrowDownSLine, RiArrowUpLine } from '@remixicon/vue'
import BrandedButton from '../BrandedButton.vue'
import TabularFilterContent from './TabularFilterContent.vue'
import { useTranslation } from '../../composables/useTranslation'
import { useTabularContext } from './useTabularContext'

const { t } = useTranslation()
const {
  mobileFilterOpen,
  allColumns,
  activeFilters,
  sort,
  filters,
  hasFilterForColumn,
  clearAllFilters,
  totalLines,
  getColumnDisplay,
  getColumnType,
  getColumnProfile,
  getNullPercent,
  getBooleanCounts,
} = useTabularContext()

// The expanded column is local to the sheet.
const expandedCol = ref<string | null>(null)

function toggleColumn(col: string) {
  expandedCol.value = expandedCol.value === col ? null : col
}
</script>
