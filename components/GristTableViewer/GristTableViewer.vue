<template>
  <div class="grist-table-viewer">
    <div
      v-if="isLoading"
      class="fr-p-4w text-center"
    >
      <AnimatedLoader />
    </div>

    <div
      v-else-if="error"
      class="fr-alert fr-alert--error fr-mb-4w"
    >
      <p class="fr-alert__title">
        {{ $t('Erreur lors du chargement des données') }}
      </p>
      <p>{{ error }}</p>
    </div>

    <template v-else-if="records.length > 0 && columns">
      <div
        v-if="filters && filters.length"
        class="fr-mb-2w group/form"
        data-input-color="blue"
      >
        <div class="fr-grid-row fr-grid-row--gutters">
          <div
            v-for="filter in filters"
            :key="filter.slug"
            class="fr-col-12 fr-col-md-6 fr-col-lg"
          >
            <SelectGroup
              v-model="selectedFilters[filter.slug].value"
              :label="filter.label"
              :options="[
                { label: filter.placeholder, value: null },
                ...filterValues[filter.slug].map(value => ({ label: value, value })),
              ]"
              hide-null-option
            />
          </div>
        </div>
        <div
          v-if="hasActiveFilter"
          class="fr-grid-row fr-grid-row--right fr-mt-1w"
        >
          <button
            class="fr-btn fr-btn--tertiary fr-btn--sm"
            type="button"
            @click="resetFilters"
          >
            {{ $t('Ré-initialiser tous les filtres') }}
          </button>
        </div>
      </div>

      <div
        v-if="filteredRecords.length === 0"
        class="fr-alert fr-alert--info fr-mb-4w"
      >
        <p class="fr-alert__title">
          {{ $t('Aucun résultat ne correspond aux filtres sélectionnés') }}
        </p>
      </div>
      <div
        v-else
        class="fr-table fr-mb-2w overflow-x-auto"
      >
        <table
          class="lg:!table"
          :style="tableMinWidth ? `min-width: ${tableMinWidth}` : undefined"
        >
          <thead>
            <tr>
              <th
                v-for="column in columns"
                :key="column"
                scope="col"
                class="font-bold"
              >
                <div class="column-header">
                  <span>{{ column }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(record, index) in filteredRecords"
              :key="record.id || index"
            >
              <slot
                name="row"
                :record="record"
              >
                <td
                  v-for="column in columns"
                  :key="column"
                >
                  {{ getFieldValue(record, column) }}
                </td>
              </slot>
            </tr>
            <tr
              v-if="total !== null"
              class="total-row"
            >
              <td
                v-for="column in columns"
                :key="column"
              >
                <div class="fr-grid-row fr-grid-row--middle fr-text--xs w-full">
                  <div class="fr-my-auto">
                    <span
                      v-if="column === props.unitColumn"
                      class="font-bold"
                    >
                      {{ formatNumber(total) }} {{ unit }}
                    </span>
                    <span v-else-if="column === columns[0]">
                      <span class="font-bold">{{ $t('Total') }}</span>
                    </span>
                    <span v-else>-</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <div
      v-else
      class="fr-alert fr-alert--info fr-mb-4w"
    >
      <p class="fr-alert__title">
        {{ $t('Aucune donnée disponible') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends GristRecord = GristRecord">
import { ref, onMounted, watch, computed } from 'vue'
import type { Ref } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { AnimatedLoader, SelectGroup, useFormatTabular } from '@datagouv/components-next'

export interface GristRecord {
  id: number
  fields: Record<string, unknown>
}

export interface GristFilter<R extends GristRecord = GristRecord> {
  slug: string
  label: string
  placeholder: string
  // Extract one or several values from a record for filtering and option building.
  getValues: (record: R) => Array<string>
  // Optional custom ordering for the dropdown options (returned values appear first, in order).
  valueOrder?: Array<string>
}

interface GristResponse {
  records: GristRecord[]
}

interface Props {
  // Source: either pass a Grist API URL to fetch from, or pass already-loaded records.
  url?: string | undefined
  data?: Array<T> | undefined
  columns?: string[] | undefined
  totalColumn?: string | undefined
  unit?: string | number | undefined
  unitColumn?: string | undefined
  filters?: Array<GristFilter<T>> | undefined
  // Optional sort applied after filtering.
  sortFn?: ((a: T, b: T) => number) | undefined
  // External loading state — used when records are provided via `data`.
  loading?: boolean
  // External error message — used when records are provided via `data`.
  error?: string | null
  // Minimum width of the table — when set, the table scrolls horizontally
  // below this width. Useful for tables with many columns.
  tableMinWidth?: string
}

const props = defineProps<Props>()

defineSlots<{
  row?: (props: { record: T }) => unknown
}>()

const { t } = useTranslation()

const internalRecords = ref<Array<GristRecord>>([])
// Start in the loading state when we fetch ourselves (url mode); in data mode the
// parent owns the loading state via the `loading` prop, so we stay out of the way.
const internalLoading = ref(!props.data)
const internalError = ref<string | null>(null)

const isLoading = computed(() => props.loading || internalLoading.value)
const error = computed(() => props.error ?? internalError.value)

// In url mode no `data` is passed, so T stays GristRecord and the cast is a no-op.
const records = computed<Array<T>>(() => props.data ?? (internalRecords.value as Array<T>))

const total = computed(() => {
  if (!props.totalColumn || !records.value.length) {
    return null
  }

  const sum = records.value.reduce((acc, record) => {
    const value = record.fields[props.totalColumn!]
    const num = Number(value)
    return acc + (isNaN(num) ? 0 : num)
  }, 0)

  return sum
})

const { formatNumber } = useFormatTabular()

// One URL query ref per filter slug. The page hosting the filters must set
// definePageMeta({ keepScroll: true }) so the query updates don't scroll back to top.
const selectedFilters: Record<string, Ref<string | null>> = Object.fromEntries(
  (props.filters ?? []).map(f => [f.slug, useRouteQuery<string | null>(f.slug, null)]),
)

const hasActiveFilter = computed(() =>
  (props.filters ?? []).some(f => selectedFilters[f.slug].value),
)

function resetFilters() {
  for (const filter of props.filters ?? []) {
    selectedFilters[filter.slug].value = null
  }
}

const filterValues = computed<Record<string, Array<string>>>(() => {
  const result: Record<string, Array<string>> = {}
  for (const filter of props.filters ?? []) {
    const set = new Set<string>()
    for (const record of records.value) {
      for (const value of filter.getValues(record)) {
        if (value) {
          set.add(value)
        }
      }
    }
    // With an empty order, indexOf always returns -1, so this falls back to a plain
    // alphabetical sort — no need for a separate branch.
    const order = filter.valueOrder ?? []
    const values = Array.from(set).sort((a, b) => {
      const ai = order.indexOf(a)
      const bi = order.indexOf(b)
      if (ai === -1 && bi === -1) return a.localeCompare(b)
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
    result[filter.slug] = values
  }
  return result
})

const filteredRecords = computed<Array<T>>(() => {
  let result = records.value
  for (const filter of props.filters ?? []) {
    const selected = selectedFilters[filter.slug].value
    if (!selected) continue
    result = result.filter(record => filter.getValues(record).includes(selected))
  }
  if (props.sortFn) {
    result = [...result].sort(props.sortFn)
  }
  return result
})

function getFieldValue(record: GristRecord, column: string): string {
  const value = record.fields[column]
  if (value === null || value === undefined) {
    return '-'
  }
  return formatNumber(value as number | string)
}

async function fetchData() {
  if (!props.url) {
    internalError.value = t('URL non définie')
    internalLoading.value = false
    return
  }

  internalLoading.value = true
  internalError.value = null

  try {
    const response = await fetch(props.url)

    if (!response.ok) {
      throw new Error(`${t('Erreur HTTP')}: ${response.status} ${response.statusText}`)
    }

    const result: GristResponse = await response.json()

    if (!result.records) {
      throw new Error(t('Format de réponse invalide: propriété "records" manquante'))
    }

    internalRecords.value = result.records
  }
  catch (err) {
    console.error('Erreur lors de la récupération des données Grist:', err)
    internalError.value = err instanceof Error ? err.message : t('Erreur inconnue')
  }
  finally {
    internalLoading.value = false
  }
}

watch(() => props.url, () => {
  if (props.url && !props.data) {
    fetchData()
  }
})

onMounted(() => {
  if (props.url && !props.data) {
    fetchData()
  }
})
</script>

<style scoped>
.grist-table-viewer {
  width: 100%;
}

.fr-table table :deep(th) {
  border-right: none;
  border-top: none;
  border-bottom: 3px solid var(--blue-france-500);
  border-left: none;
  text-align: left;
  white-space: nowrap;
}

.fr-table table :deep(tbody tr:nth-child(even)) {
  background-color: var(--background-alt-grey);
  --hover: var(--background-alt-grey-hover);
  --active: var(--background-alt-grey-active);
}

.fr-table table :deep(td) {
  border-right: none;
  border-left: none;
  border-top: none;
  border-bottom: 1px solid #cecece;
}

.fr-table :deep(tbody), .fr-table :deep(thead) {
  background-color: var(--background-default-grey);
  --hover: var(--background-default-gray-hover);
  --active: var(--background-default-gray-active);
}

.total-row {
  background-color: var(--background-contrast-grey) !important;
  border-top: 2px solid var(--blue-france-500);
}

.total-row td {
  font-weight: 600;
}

.column-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}
</style>
