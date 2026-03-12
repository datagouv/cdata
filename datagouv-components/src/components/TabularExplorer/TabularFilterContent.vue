<template>
  <div>
    <!-- Sort -->
    <div class="flex items-center gap-1 px-2 py-1.5 border-b border-black/10 text-xs">
      <span class="text-[#3A3A3A]">{{ t('Trier') }}</span>
      <BrandedButton
        :color="sort?.column === column && sort?.direction === 'asc' ? 'primary' : 'tertiary'"
        size="2xs"
        :icon="RiArrowUpLine"
        keep-margins-even-without-borders
        @click="toggleSort('asc')"
      >
        {{ t('Croissant') }}
      </BrandedButton>
      <BrandedButton
        :color="sort?.column === column && sort?.direction === 'desc' ? 'primary' : 'tertiary'"
        size="2xs"
        :icon="RiArrowDownLine"
        keep-margins-even-without-borders
        @click="toggleSort('desc')"
      >
        {{ t('Décroissant') }}
      </BrandedButton>
    </div>

    <!-- Search (contains) -->
    <div class="px-3 py-2 border-b border-black/10">
      <div class="relative">
        <RiSearchLine
          class="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-gray-medium"
          aria-hidden="true"
        />
        <input
          v-model="search"
          type="text"
          class="w-full h-8 text-sm border border-transparent rounded-lg py-1 pl-8 pr-3 bg-[#f3f3f5] focus:outline-none focus:border-blue-main"
          :placeholder="t('Rechercher...')"
        >
      </div>
    </div>

    <!-- Categorical values -->
    <div
      v-if="columnType === 'categorical' && columnProfile?.tops && filteredTops.length"
      class="overflow-auto p-1"
    >
      <label
        v-for="top in filteredTops"
        :key="top.value"
        class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-xs"
      >
        <input
          type="checkbox"
          class="size-4 rounded shrink-0 accent-blue-main"
          :checked="isValueSelected(top.value)"
          @change="toggleValue(top.value)"
        >
        <span class="truncate font-medium">{{ top.value ?? 'null' }}</span>
        <span class="ml-auto text-[#717182] font-medium shrink-0">{{ top.count }}</span>
      </label>
    </div>

    <!-- Null filter -->
    <div
      v-if="columnProfile && columnProfile.nb_missing_values > 0"
      class="px-3 py-2 border-b border-black/10 space-y-1.5"
    >
      <p class="text-[11px] text-gray-medium mb-0">
        {{ columnProfile.nb_missing_values }} null ({{ nullPercent }})
      </p>
      <div class="flex items-center gap-1">
        <BrandedButton
          :color="nullFilter === 'only' ? 'primary' : 'tertiary'"
          size="2xs"
          keep-margins-even-without-borders
          @click="toggleNullFilter('only')"
        >
          {{ t('Null uniquement') }}
        </BrandedButton>
        <BrandedButton
          :color="nullFilter === 'exclude' ? 'primary' : 'tertiary'"
          size="2xs"
          keep-margins-even-without-borders
          @click="toggleNullFilter('exclude')"
        >
          {{ t('Exclure null') }}
        </BrandedButton>
      </div>
    </div>

    <!-- Number range -->
    <template v-if="columnType === 'number' && columnProfile">
      <div class="px-3 py-2 border-b border-black/10 space-y-2">
        <div class="flex items-center gap-2 text-xs text-[#3A3A3A]">
          <span class="tabular-nums">{{ profileMin.toLocaleString('fr-FR') }}</span>
          <span class="text-gray-medium">—</span>
          <span class="tabular-nums">{{ profileMax.toLocaleString('fr-FR') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <input
            v-model.number="rangeMin"
            type="number"
            class="w-full h-7 text-xs border border-black/10 rounded px-2 bg-[#f3f3f5] focus:outline-none focus:border-blue-main tabular-nums"
            :placeholder="String(profileMin)"
            :min="profileMin"
            :max="profileMax"
          >
          <span class="text-gray-medium text-xs">–</span>
          <input
            v-model.number="rangeMax"
            type="number"
            class="w-full h-7 text-xs border border-black/10 rounded px-2 bg-[#f3f3f5] focus:outline-none focus:border-blue-main tabular-nums"
            :placeholder="String(profileMax)"
            :min="profileMin"
            :max="profileMax"
          >
        </div>
        <div class="flex items-center gap-2">
          <BrandedButton
            color="primary"
            size="2xs"
            @click="applyRange"
          >
            {{ t('Appliquer') }}
          </BrandedButton>
          <BrandedButton
            color="tertiary"
            size="2xs"
            keep-margins-even-without-borders
            @click="clearRange"
          >
            {{ t('Effacer') }}
          </BrandedButton>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  RiArrowUpLine,
  RiArrowDownLine,
  RiSearchLine,
} from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import BrandedButton from '../BrandedButton.vue'
import type { TabularColumnProfile, ColumnType, ColumnFilters, SortConfig, SortDirection } from './types'

const props = defineProps<{
  column: string
  columnType: ColumnType
  columnProfile: TabularColumnProfile | null
  nullPercent: string
}>()

const sort = defineModel<SortConfig | null>('sort')
const filters = defineModel<Record<string, ColumnFilters>>('filters', { default: () => ({}) })

const { t } = useTranslation()

const search = ref('')

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

watch(search, (q) => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    const existing = filters.value[props.column] ?? {}
    if (q) {
      filters.value = { ...filters.value, [props.column]: { ...existing, contains: q } }
    }
    else {
      const { contains: _, ...rest } = existing
      filters.value = { ...filters.value, [props.column]: rest }
    }
  }, 300)
})

// Null filter helpers
const nullFilter = computed(() => filters.value[props.column]?.null ?? null)

function toggleNullFilter(mode: 'only' | 'exclude') {
  const existing = filters.value[props.column] ?? {}
  if (existing.null === mode) {
    const { null: _, ...rest } = existing
    filters.value = { ...filters.value, [props.column]: rest }
  }
  else {
    filters.value = { ...filters.value, [props.column]: { ...existing, null: mode } }
  }
}

// Categorical filter helpers
const selectedValues = computed(() => filters.value[props.column]?.in ?? [])

const filteredTops = computed(() => {
  if (!props.columnProfile?.tops) return []
  if (!search.value) return props.columnProfile.tops
  const q = search.value.toLowerCase()
  return props.columnProfile.tops.filter(top =>
    (top.value ?? '').toLowerCase().includes(q),
  )
})

function isValueSelected(value: string) {
  return selectedValues.value.includes(value)
}

function toggleValue(value: string) {
  const current = selectedValues.value
  const next = current.includes(value)
    ? current.filter(v => v !== value)
    : [...current, value]
  const existing = filters.value[props.column] ?? {}
  filters.value = { ...filters.value, [props.column]: { ...existing, in: next } }
}

// Number range filter helpers
const profileMin = computed(() => props.columnProfile?.min ?? 0)
const profileMax = computed(() => props.columnProfile?.max ?? 100)
const rangeMin = ref<number | undefined>(undefined)
const rangeMax = ref<number | undefined>(undefined)

function isValidNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function applyRange() {
  const existing = filters.value[props.column] ?? {}
  const next = { ...existing }
  if (isValidNumber(rangeMin.value)) {
    next.min = rangeMin.value
  }
  else {
    delete next.min
  }
  if (isValidNumber(rangeMax.value)) {
    next.max = rangeMax.value
  }
  else {
    delete next.max
  }
  filters.value = { ...filters.value, [props.column]: next }
}

function clearRange() {
  rangeMin.value = undefined
  rangeMax.value = undefined
  const existing = filters.value[props.column]
  if (existing) {
    const { min: _min, max: _max, ...rest } = existing
    filters.value = { ...filters.value, [props.column]: rest }
  }
}

function toggleSort(direction: SortDirection) {
  if (sort.value?.column === props.column && sort.value.direction === direction) {
    sort.value = null
  }
  else {
    sort.value = { column: props.column, direction }
  }
}
</script>
