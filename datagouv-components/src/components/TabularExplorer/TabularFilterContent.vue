<template>
  <div>
    <!-- Sort -->
    <div class="flex items-center gap-1 px-2 py-1.5 border-b border-black/10 text-xs">
      <span class="text-gray-plain">{{ t('Trier') }}</span>
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

    <!-- Null filter with progress bar -->
    <div
      v-if="columnProfile && columnProfile.nb_missing_values > 0"
      class="flex items-center gap-2 px-3 py-2 border-b border-black/10"
    >
      <span class="text-xs text-gray-plain whitespace-nowrap">
        <span class="font-mono tabular-nums">{{ columnProfile.nb_missing_values }}</span>
        null
        <span class="text-gray-low">({{ nullPercent }})</span>
      </span>
      <ProgressBar
        :value="columnProfile.nb_missing_values"
        :max="totalLines"
        bar-class="bg-gray-low"
        class="flex-1 !h-1.5 !min-w-0 !border-0 !bg-gray-default"
      />
      <div class="flex items-center gap-0.5">
        <BrandedButton
          :color="nullFilter === 'only' ? 'primary' : 'tertiary'"
          size="2xs"
          keep-margins-even-without-borders
          @click="toggleNullFilter('only')"
        >
          {{ t('seul.') }}
        </BrandedButton>
        <BrandedButton
          :color="nullFilter === 'exclude' ? 'primary' : 'tertiary'"
          size="2xs"
          keep-margins-even-without-borders
          @click="toggleNullFilter('exclude')"
        >
          {{ t('exclure') }}
        </BrandedButton>
      </div>
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
          class="w-full h-8 text-sm border border-transparent rounded-lg py-1 pl-8 pr-3 bg-[#f3f3f5] focus:outline-none focus:border-new-primary"
          :placeholder="t('Rechercher...')"
        >
      </div>
    </div>

    <!-- Categorical values -->
    <div
      v-if="columnType === 'categorical' && columnProfile?.tops && filteredTops.length"
      class="max-h-56 overflow-auto p-1"
    >
      <button
        v-for="top in filteredTops"
        :key="top.value"
        class="flex w-full items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-xs select-none"
        :class="isValueSelected(top.value) && 'bg-gray-50'"
        @click="toggleValue(top.value)"
      >
        <span
          class="flex size-4 shrink-0 items-center justify-center rounded border"
          :class="isValueSelected(top.value) ? 'border-new-primary bg-new-primary text-white' : 'border-gray-low'"
        >
          <RiCheckLine
            v-if="isValueSelected(top.value)"
            class="size-3"
            aria-hidden="true"
          />
        </span>
        <span class="flex-1 truncate text-left text-xs">
          <span
            v-if="categoryBadgeStyles?.[top.value]"
            class="inline-block rounded font-medium px-2 py-0.5 text-xs"
            :style="{ backgroundColor: categoryBadgeStyles[top.value].backgroundColor, color: categoryBadgeStyles[top.value].color }"
          >{{ top.value }}</span>
          <template v-else>
            {{ top.value ?? 'null' }}
          </template>
        </span>
        <span class="font-mono text-xs text-gray-low tabular-nums shrink-0">{{ top.count }}</span>
      </button>
    </div>

    <!-- Boolean filter -->
    <div
      v-if="columnType === 'boolean'"
      class="px-3 py-3 space-y-1.5"
    >
      <button
        class="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs transition-colors"
        :class="booleanFilter === true ? 'bg-new-primary text-white' : 'bg-gray-some text-gray-title hover:bg-gray-default'"
        @click="toggleBooleanFilter(true)"
      >
        <span
          class="size-2.5 rounded-full shrink-0"
          :class="booleanFilter === true ? 'bg-new-success-light' : 'bg-new-success'"
        />
        <span class="flex-1 text-left">{{ t('Vrai') }}</span>
        <span
          v-if="booleanCounts"
          class="font-mono tabular-nums text-xs"
          :class="booleanFilter === true ? 'text-white/70' : 'text-gray-low'"
        >{{ booleanCounts.trueCount }}</span>
      </button>
      <button
        class="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs transition-colors"
        :class="booleanFilter === false ? 'bg-new-primary text-white' : 'bg-gray-some text-gray-title hover:bg-gray-default'"
        @click="toggleBooleanFilter(false)"
      >
        <span
          class="size-2.5 rounded-full shrink-0"
          :class="booleanFilter === false ? 'bg-new-warning-light' : 'bg-new-error'"
        />
        <span class="flex-1 text-left">{{ t('Faux') }}</span>
        <span
          v-if="booleanCounts"
          class="font-mono tabular-nums text-xs"
          :class="booleanFilter === false ? 'text-white/70' : 'text-gray-low'"
        >{{ booleanCounts.falseCount }}</span>
      </button>
    </div>

    <!-- Number range -->
    <form
      v-if="columnType === 'number' && columnProfile"
      class="px-3 py-2 border-b border-black/10 space-y-2"
      @submit.prevent="applyRange"
    >
      <div class="flex items-center gap-2 text-xs text-gray-plain">
        <span class="tabular-nums">{{ formatNumber(profileMin) }}</span>
        <span class="text-gray-medium">—</span>
        <span class="tabular-nums">{{ formatNumber(profileMax) }}</span>
      </div>
      <div class="flex items-center gap-2">
        <input
          v-model.number="rangeMin"
          type="number"
          class="w-full h-7 text-xs border border-black/10 rounded px-2 bg-[#f3f3f5] focus:outline-none focus:border-new-primary tabular-nums"
          :placeholder="String(profileMin)"
          :min="profileMin"
          :max="profileMax"
        >
        <span class="text-gray-medium text-xs">–</span>
        <input
          v-model.number="rangeMax"
          type="number"
          class="w-full h-7 text-xs border border-black/10 rounded px-2 bg-[#f3f3f5] focus:outline-none focus:border-new-primary tabular-nums"
          :placeholder="String(profileMax)"
          :min="profileMin"
          :max="profileMax"
        >
      </div>
      <div class="flex items-center gap-2">
        <BrandedButton
          color="primary"
          size="2xs"
          type="submit"
        >
          {{ t('Appliquer') }}
        </BrandedButton>
        <BrandedButton
          color="tertiary"
          size="2xs"
          type="button"
          keep-margins-even-without-borders
          @click="clearRange"
        >
          {{ t('Effacer') }}
        </BrandedButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import {
  RiArrowUpLine,
  RiArrowDownLine,
  RiSearchLine,
  RiCheckLine,
} from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import { formatNumber } from '../../functions/tabular'
import BrandedButton from '../BrandedButton.vue'
import ProgressBar from '../ProgressBar.vue'
import type { TabularColumnProfile, ColumnType, ColumnFilters, SortConfig, SortDirection, BadgeStyle } from './types'

const props = defineProps<{
  column: string
  columnType: ColumnType
  columnProfile: TabularColumnProfile | null
  nullPercent: string
  totalLines: number
  categoryBadgeStyles?: Record<string, BadgeStyle>
  booleanCounts?: { trueCount: number, falseCount: number }
}>()

const sort = defineModel<SortConfig | null>('sort')
const filters = defineModel<Record<string, ColumnFilters>>('filters', { default: () => ({}) })

const { t } = useTranslation()

const search = ref('')

watchDebounced(search, (q) => {
  const existing = filters.value[props.column] ?? {}
  if (q) {
    filters.value = { ...filters.value, [props.column]: { ...existing, contains: q } }
  }
  else {
    const { contains: _, ...rest } = existing
    filters.value = { ...filters.value, [props.column]: rest }
  }
}, { debounce: 300 })

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

function applyRange() {
  const existing = filters.value[props.column] ?? {}
  const next = { ...existing }
  if (Number.isFinite(rangeMin.value)) {
    next.min = rangeMin.value
  }
  else {
    delete next.min
  }
  if (Number.isFinite(rangeMax.value)) {
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

// Boolean filter helpers
const booleanFilter = computed<boolean | null>(() => {
  const f = filters.value[props.column]
  if (!f || f.exact == null) return null
  return f.exact === 'true'
})

function toggleBooleanFilter(value: boolean) {
  const existing = filters.value[props.column] ?? {}
  const strValue = String(value)
  if (existing.exact === strValue) {
    const { exact: _, ...rest } = existing
    filters.value = { ...filters.value, [props.column]: rest }
  }
  else {
    filters.value = { ...filters.value, [props.column]: { ...existing, exact: strValue } }
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
