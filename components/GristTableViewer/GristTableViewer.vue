<template>
  <div class="grist-table-viewer">
    <div
      v-if="loading"
      class="fr-p-4w text-center"
    >
      <AnimatedLoader />
    </div>

    <div
      v-else-if="error"
      class="fr-alert fr-alert--error fr-mb-4w"
    >
      <p class="fr-alert__title">
        Erreur lors du chargement des données
      </p>
      <p>{{ error }}</p>
    </div>

    <div
      v-else-if="data && data.length > 0 && columns"
      class="fr-table fr-mb-2w"
    >
      <table
        class="lg:!table"
        style="table-layout: fixed; width: 100%;"
      >
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column"
              scope="col"
              class="font-bold fixed-col-width"
            >
              <div class="column-header">
                <span>{{ column }}</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(record, index) in data"
            :key="record.id || index"
          >
            <td
              v-for="column in columns"
              :key="column"
              class="cell-padding fixed-col-width"
            >
              <div class="fr-grid-row fr-grid-row--middle fr-text--2xs style-cell">
                <div class="fr-my-auto">
                  {{ getFieldValue(record, column) }}
                </div>
              </div>
            </td>
          </tr>
          <tr
            v-if="total !== null"
            class="total-row"
          >
            <td
              v-for="column in columns"
              :key="column"
            >
              <div class="fr-grid-row fr-grid-row--middle fr-text--xs w-full style-cell">
                <div class="fr-my-auto">
                  <span
                    v-if="column === props.unitColumn"
                    class="font-bold"
                  >
                    {{ formatNumber(total) }} {{ unit }}
                  </span>
                  <span v-else-if="column === columns[0]">
                    <span class="font-bold">Total</span>
                  </span>
                  <span v-else>-</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-else
      class="fr-alert fr-alert--info fr-mb-4w"
    >
      <p class="fr-alert__title">
        Aucune donnée disponible
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { AnimatedLoader } from '@datagouv/components-next'

interface GristRecord {
  id: number
  fields: Record<string, string | number | boolean | null>
}

interface GristResponse {
  records: GristRecord[]
}

interface Props {
  url: string | undefined
  columns: string[] | undefined
  totalColumn?: string | undefined
  unit?: string | number | undefined
  unitColumn?: string | undefined
}

const props = defineProps<Props>()

const data = ref<GristRecord[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const total = computed(() => {
  if (!props.totalColumn || !data.value.length) {
    return null
  }

  const sum = data.value.reduce((acc, record) => {
    const value = record.fields[props.totalColumn!]
    const num = Number(value)
    return acc + (isNaN(num) ? 0 : num)
  }, 0)

  return sum
})

function formatNumber(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '-'
  }

  const num = Number(value)
  if (isNaN(num)) {
    return String(value)
  }

  return num.toLocaleString('fr-FR')
}

function getFieldValue(record: GristRecord, column: string): string {
  const value = record.fields[column]
  if (value === null || value === undefined) {
    return '-'
  }
  return formatNumber(value)
}

async function fetchData() {
  if (!props.url) {
    error.value = 'URL non définie'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await fetch(props.url)

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
    }

    const result: GristResponse = await response.json()

    if (!result.records) {
      throw new Error('Format de réponse invalide: propriété "records" manquante')
    }

    data.value = result.records
  }
  catch (err) {
    console.error('Erreur lors de la récupération des données Grist:', err)
    error.value = err instanceof Error ? err.message : 'Erreur inconnue'
  }
  finally {
    loading.value = false
  }
}

watch(() => props.url, () => {
  if (props.url) {
    fetchData()
  }
})

onMounted(() => {
  if (props.url) {
    fetchData()
  }
})
</script>

<style scoped>
.grist-table-viewer {
  width: 100%;
}

.fr-table {
  --lh: 1.125rem;
  --max-lines: 2;
}

.fr-table table {
  table-layout: auto !important;
}

.fr-table table :deep(th) {
  border-right: none;
  border-top: none;
  border-bottom: 3px solid var(--blue-france-500);
  border-left: none;
  padding: 0.34375rem !important;
  text-transform: uppercase;
  font-size: 1.05rem;
  line-height: var(--lh);
  text-align: left;
  height: 2.8rem;
}

.fr-table table :deep(tbody tr:nth-child(even)) {
  background-color: var(--background-alt-grey);
  --hover: var(--background-alt-grey-hover);
  --active: var(--background-alt-grey-active);
}

.fr-table table :deep(td) {
  padding: 0.8rem 0.4rem !important;
  border-right: none;
  border-left: none;
  border-top: none;
  border-bottom: 1px solid #cecece;
  height: calc(var(--lh) * var(--max-lines) + 1rem);
  font-size: 1.05rem;
}

.fr-table table :deep(*) {
  font-size: 1.05rem;
  line-height: var(--lh);
}

.fr-table :deep(tbody), .fr-table :deep(thead) {
  background-color: var(--background-default-grey);
  --hover: var(--background-default-gray-hover);
  --active: var(--background-default-gray-active);
}

.style-cell {
  font-size: 0.85em;
}

.style-cell,
.style-cell * {
  font-size: 0.9em !important;
  line-height: 1.2;
}

th {
  border-bottom: 3px solid var(--blue-france-500);
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

.unit-label {
  font-size: 0.625rem;
  font-weight: normal;
  color: var(--text-mention-grey);
  text-transform: none;
}

.fixed-col-width {
  width: 1%;
}
</style>
