<template>
  <ClientOnly>
    <Teleport to="#tooltips">
      <div
        v-if="cell"
        ref="panel"
        class="bg-white border border-black/10 rounded-lg shadow-md w-80 absolute z-[800]"
        :style="floatingStyles"
      >
        <!-- Value -->
        <div class="px-3 pt-3 pb-2 border-b border-[#E5E5E5]">
          <p class="text-[10px] text-[#3A3A3A] mb-0">
            {{ t('Valeur brute') }}
          </p>
          <p class="text-xs text-[#161616] mb-0">
            {{ displayValue }}
          </p>
        </div>

        <!-- Type -->
        <div class="flex items-center gap-2 px-3 py-2 border-b border-[#E5E5E5]">
          <span class="text-[10px] text-[#3A3A3A]">{{ t('Type') }}</span>
          <span class="inline-flex items-center gap-1 bg-[#f6f6f6] rounded px-1.5 py-0.5 text-xs text-[#3A3A3A]">
            <component
              :is="typeIcon"
              class="size-3"
              aria-hidden="true"
            />
            {{ typeLabel }}
          </span>
          <span class="text-[10px] text-[#3A3A3A] shrink-0">·</span>
          <span class="text-[10px] text-[#3A3A3A] truncate min-w-0">{{ cell.column }}</span>
        </div>

        <!-- Actions -->
        <div class="p-1">
          <button
            class="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-xs font-medium hover:bg-gray-50"
            @click="filterByValue"
          >
            <RiFilter2Line
              class="size-4"
              aria-hidden="true"
            />
            {{ t('Filtrer par cette valeur') }}
          </button>
          <button
            class="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-xs font-medium hover:bg-gray-50"
            @click="copyValue"
          >
            <RiCheckLine
              v-if="copied"
              class="size-4 text-green-500"
              aria-hidden="true"
            />
            <RiFileCopyLine
              v-else
              class="size-4 text-[#3A3A3A]"
              aria-hidden="true"
            />
            {{ copied ? t('Copié !') : t('Copier la valeur') }}
          </button>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { flip, shift, autoUpdate, useFloating } from '@floating-ui/vue'
import { onClickOutside } from '@vueuse/core'
import {
  RiFilter2Line,
  RiFileCopyLine,
  RiCheckLine,
} from '@remixicon/vue'
import { toast } from 'vue-sonner'
import { useTranslation } from '../../composables/useTranslation'
import { buildTypeConfig } from '../../functions/tabular'
import ClientOnly from '../ClientOnly.vue'
import type { ColumnType, ColumnFilters } from './types'

export interface CellInfo {
  column: string
  columnType: ColumnType
  value: unknown
  element: HTMLElement
}

const cell = defineModel<CellInfo | null>('cell', { default: null })
const filters = defineModel<Record<string, ColumnFilters>>('filters', { default: () => ({}) })

const { t } = useTranslation()

const panelRef = useTemplateRef<HTMLElement>('panel')
const anchorRef = ref<HTMLElement | null>(null)

watch(cell, (c) => {
  anchorRef.value = c?.element ?? null
})

const { floatingStyles } = useFloating(anchorRef, panelRef, {
  placement: 'bottom-start',
  middleware: [flip(), shift()],
  whileElementsMounted: autoUpdate,
})

const displayValue = computed(() => {
  if (!cell.value) return ''
  const v = cell.value.value
  if (v == null || v === '') return '–'
  return String(v)
})

const typeConfig = buildTypeConfig(t)

const typeIcon = computed(() => cell.value ? typeConfig[cell.value.columnType].icon : typeConfig.text.icon)
const typeLabel = computed(() => cell.value ? typeConfig[cell.value.columnType].label : '')

function close() {
  cell.value = null
}

function filterByValue() {
  if (!cell.value) return
  const val = String(cell.value.value ?? '')
  const col = cell.value.column
  const existing = filters.value[col] ?? {}
  if (cell.value.columnType === 'categorical' || cell.value.columnType === 'text') {
    const current = existing.in ?? []
    if (!current.includes(val)) {
      filters.value = { ...filters.value, [col]: { ...existing, in: [...current, val] } }
    }
  }
  else if (cell.value.columnType === 'number') {
    const num = Number(cell.value.value)
    if (Number.isFinite(num)) {
      filters.value = { ...filters.value, [col]: { ...existing, min: num, max: num } }
    }
  }
  close()
}

const copied = ref(false)

async function copyValue() {
  try {
    await navigator.clipboard.writeText(displayValue.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  }
  catch {
    toast.error(t('Impossible de copier dans le presse-papier'))
  }
}

onClickOutside(panelRef, (e) => {
  if (!cell.value) return
  const clickedTd = (e.target as HTMLElement).closest('td')
  if (clickedTd && clickedTd === cell.value.element) return
  close()
})
</script>
