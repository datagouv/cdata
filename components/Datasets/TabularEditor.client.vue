<template>
  <div>
    <div>
      <div class="grid grid-cols-2 items-center mb-4">
        <div>
          <InputGroup
            v-model="resourceTitle"
            :label="t('Titre de la ressource')"
            :required="true"
            placeholder="donnees-schema"
          />
        </div>

        <div class="flex flex-wrap justify-end gap-3">
          <BrandedButton
            color="primary"
            :loading="validating"
            :icon="RiCheckLine"
            @click="validateData"
          >
            {{ $t('Valider les données') }}
          </BrandedButton>
          <BrandedButton
            color="secondary"
            :icon="RiDownloadLine"
            @click="downloadCSV"
          >
            {{ $t('Télécharger en CSV') }}
          </BrandedButton>
        </div>
      </div>

      <div
        v-if="validationReport"
        class="mb-6"
      >
        <SimpleBanner
          v-if="hasNoErrors"
          type="success"
          class="mb-4"
        >
          <template #title>
            {{ $t('Validation réussie') }}
          </template>
          <p class="fr-m-0">
            {{ $t('Vos données sont conformes au schéma.') }}
          </p>
          <p
            v-if="validationReport.report?.stats"
            class="fr-m-0 fr-text--sm fr-mt-1w"
          >
            {{ validationReport.report.stats.rows_processed }} {{ $t('lignes traitées') }}
          </p>
        </SimpleBanner>

        <SimpleBanner
          v-else
          type="danger"
          class="mb-4"
        >
          <p class="mb-1">
            {{ $t('Votre fichier contient des erreurs') }}
          </p>
          <p
            v-if="validationReport.report?.stats"
            class="m-0 text-xs"
          >
            {{ $t('Nous vous conseillons de corriger ces erreurs avant de continuer.') }}
          </p>
        </SimpleBanner>

        <div v-if="!hasNoErrors && validationReport.report?.errors && validationReport.report.errors.length > 0">
          <AccordionGroup :with-icon="false">
            <Accordion
              :title="$t(`Voir le rapport d'erreur détaillé`)"
              state="default"
            >
              <div class="fr-table fr-table--bordered">
                <table>
                  <thead>
                    <tr>
                      <th>{{ $t('Ligne') }}</th>
                      <th>{{ $t('Colonne') }}</th>
                      <th>{{ $t('Type') }}</th>
                      <th>{{ $t('Erreur') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(error, index) in (validationReport.report?.errors || []).slice(0, 50)"
                      :key="index"
                    >
                      <td>{{ error.rowNumber - 1 || '-' }}</td>
                      <td>{{ error.fieldName || error.fieldNumber || '-' }}</td>
                      <td>{{ error.title || error.type }}</td>
                      <td class="fr-text--sm">
                        {{ error.message }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p
                v-if="(validationReport.report?.errors?.length || 0) > 50"
                class="fr-text--sm fr-mt-2w"
              >
                {{ $t('Seules les 50 premières erreurs sont affichées.') }}
              </p>
            </Accordion>
          </AccordionGroup>
        </div>
      </div>

      <SimpleBanner
        type="gray"
        class="mb-2 flex items-center gap-1"
      >
        <RiInformationLine class="size-4" />
        <p class="text-sm mb-0">
          {{ $t(`Un menu d'édition est accessible au clic droit dans le tableau.`) }}
        </p>
      </SimpleBanner>

      <div ref="tableRef" />

      <div class="mt-2">
        <BrandedButton
          color="secondary"
          :icon="RiAddLine"
          size="xs"
          @click="addRow"
        >
          {{ $t('Ajouter une ligne') }}
        </BrandedButton>
      </div>
    </div>
    <SimpleBanner
      v-if="customErrors.length"
      type="danger"
      class="my-4"
    >
      <template #title>
        {{ $t("Une erreur est survenue | Des erreurs sont survenues", customErrors.length) }}
      </template>
      <ul v-if="customErrors.length > 1">
        <li
          v-for="error in customErrors"
          :key="error"
        >
          {{ error }}
        </li>
      </ul>
      <p
        v-else
        class="mb-0"
      >
        {{ customErrors[0] }}
      </p>
    </SimpleBanner>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, escapeCsvValue, SimpleBanner, type RegisteredSchema, type SchemaDetails, type SchemaField } from '@datagouv/components-next'
import { RiAddLine, RiCheckLine, RiDownloadLine, RiInformationLine } from '@remixicon/vue'
import { ofetch } from 'ofetch'
import paparse from 'papaparse'
import { TabulatorFull as Tabulator, type CellComponent, type Editor, type Formatter, type GlobalTooltipOption, type RowComponent } from 'tabulator-tables'
import type { ValidationReport } from '~/types/schema'

interface RowData {
  [key: string]: string | number | null | undefined
}

const props = defineProps<{
  schema: RegisteredSchema | null
  schemaDetails?: SchemaDetails | null
}>()

const uploadedFile = defineModel<File | null>('uploadedFile', { required: true })
const resourceTitle = defineModel<string>('resourceTitle', { required: true })
const validationReport = defineModel<ValidationReport | null>('validationReport', { required: true })

const tableRef = useTemplateRef<HTMLDivElement>('tableRef')
let table: Tabulator | null = null
const { t } = useTranslation()

const customErrors = ref<string[]>([])
const validating = ref(false)

const schemaFields = computed(() => props.schemaDetails?.fields.map((field: SchemaField) => field.name) ?? [])

const hasNoErrors = computed(() => {
  if (!validationReport.value) return false
  const errorCount = validationReport.value.report?.errors?.length || 0
  return errorCount === 0
})

// Structure pour stocker les erreurs de validation
// Format: { "rowIndex_columnField": { title: string, message: string } }
const validationErrors = ref<Record<string, { title: string, message: string }>>({})

function getFieldDescription(fieldName: string): string {
  if (!props.schemaDetails || !props.schemaDetails.fields) {
    return t('Aucune description disponible')
  }

  const field = props.schemaDetails.fields.find((f: SchemaField) => f.name === fieldName)
  return field?.description || t('Aucune description disponible')
}

function cellTooltip(_e: MouseEvent, cell: CellComponent): string | undefined {
  const row = cell.getRow()
  const pos = row.getPosition()
  if (pos) {
    const rowIndex = pos - 1
    const field = cell.getField()
    const errorKey = `${rowIndex}_${field}`

    if (validationErrors.value[errorKey]) {
      const error = validationErrors.value[errorKey]
      return `<b>${error.title}</b><br>${error.message}`
    }
  }
  return undefined
}

function getColumns() {
  const rowNumberColumn = {
    title: '',
    field: '_rowNumber',
    formatter: 'rownum' as Formatter,
    width: 60,
    hozAlign: 'center' as const,
    headerSort: false,
    frozen: true,
  }

  const dataColumns = schemaFields.value.map(field => ({
    title: field,
    field: field,
    editor: 'input' as Editor,
    resizable: true,
    minWidth: 200,
    tooltip: cellTooltip as GlobalTooltipOption,
    headerSort: false,
    headerPopup: `<strong> ${t('Description')} :</strong> ${getFieldDescription(field)}`,
    headerPopupIcon: `<span aria-hidden="true" class="fr-icon-information-line fr-icon--sm"></span>`,
  }))

  return [rowNumberColumn, ...dataColumns]
}

function addRow() {
  if (table) {
    const newRow: RowData = {}
    schemaFields.value.forEach((col) => {
      newRow[col] = ''
    })
    table.addRow(newRow)
  }
}

function generateCSV(): string {
  if (!table) return ''

  const data = table.getData() as RowData[]

  const filteredData = data.filter((row: RowData) => {
    return schemaFields.value.some(col => row[col])
  })

  const header = schemaFields.value.map(col => escapeCsvValue(col)).join(',')
  const rows = filteredData.map((row: RowData) => {
    return schemaFields.value
      .map(col => escapeCsvValue(row[col]))
      .join(',')
  })

  return [header, ...rows].join('\n')
}

async function validateData() {
  if (!table) return

  validationErrors.value = {}
  validationReport.value = null
  validating.value = true
  customErrors.value = []

  try {
    const data = table.getData() as RowData[]
    const hasData = data.some((row: RowData) => {
      return schemaFields.value.some(col => row[col])
    })

    if (!hasData) {
      customErrors.value = [t('Veuillez saisir au moins une ligne de données avant de valider.')]
      validating.value = false
      return
    }

    if (!props.schema?.schema_url) {
      customErrors.value = [t(`L'URL du schéma est introuvable. Veuillez retourner à l'étape 1.`)]
      validating.value = false
      return
    }

    const csvContent = generateCSV()

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const formData = new FormData()
    formData.append('file', blob, 'data.csv')
    formData.append('schema', props.schema.schema_url)

    validationReport.value = await ofetch<ValidationReport>('https://api.validata.etalab.studio/validate', {
      method: 'POST',
      body: formData,
    })
  }
  catch (error) {
    console.error('Erreur lors de la validation:', error)
    customErrors.value = [t('Erreur lors de la validation des données. Veuillez réessayer.')]
  }
  finally {
    validating.value = false
  }
}

async function initializeTable() {
  await nextTick()

  if (!tableRef.value) {
    console.error('tableRef.value est null')
    return
  }
  let tableData: RowData[] = []
  if (uploadedFile.value) {
    try {
      paparse.parse<RowData, File>(uploadedFile.value, {
        header: true,
        complete: function (results) {
          tableData = results.data.map((r, i) => {
            return { id: i, ...r }
          })
          makeTable(tableData, true)
          uploadedFile.value = null
        },
      })
    }
    catch (error) {
      console.error('Erreur lors du chargement du fichier:', error)
      customErrors.value = [t('Erreur lors du chargement du fichier CSV')]
      tableData = createEmptyRows(1)
      makeTable(tableData)
    }
  }
  else {
    tableData = createEmptyRows(1)
    makeTable(tableData)
  }
}

async function makeTable(data: Array<RowData>, shouldValidate = false) {
  if (!tableRef.value) {
    return
  }
  table = new Tabulator(tableRef.value, {
    data: data,
    layout: 'fitData',
    columns: getColumns(),
    rowContextMenu: [
      {
        label: t('Dupliquer la ligne'),
        action: function (_e: MouseEvent, row: RowComponent) {
          if (table) {
            table.addRow({ id: table.getDataCount(), ...row.getData() }, false, row.getIndex())
          }
        },
      },
      {
        separator: true,
      },
      {
        label: t('Ajouter une ligne'),
        action: function (_e: MouseEvent, row: RowComponent) {
          if (table) {
            table.addRow({ id: table.getDataCount() }, false, row.getIndex())
          }
        },
      },
      {
        separator: true,
      },
      {
        label: t('Supprimer cette ligne'),
        action: function (_e: MouseEvent, row: RowComponent) {
          row.delete()
        },
      },
    ],
  })

  if (shouldValidate) {
    await nextTick()
    setTimeout(() => {
      validateData()
    }, 500)
  }
}

function createEmptyRows(count = 10): RowData[] {
  const rows: RowData[] = []
  for (let i = 0; i < count; i++) {
    const row: RowData = { id: i }
    schemaFields.value.forEach((col) => {
      row[col] = ''
    })
    rows.push(row)
  }
  return rows
}

function applyCellErrors() {
  if (!table) return

  const rows = table.getRows()
  rows.forEach((row: RowComponent) => {
    const pos = row.getPosition()
    if (pos) {
      const rowIndex = pos - 1
      schemaFields.value.forEach((field: string) => {
        const cell = row.getCell(field)
        const errorKey = `${rowIndex}_${field}`
        const cellElement = cell.getElement()
        if (validationErrors.value[errorKey]) {
          cellElement.classList.add('cell-error')
        }
        else {
          cellElement.classList.remove('cell-error')
        }
      })
    }
  })
}

function downloadCSV() {
  if (!table) {
    alert(t(`'La table n'est pas encore chargée`))
    return
  }

  const data = table.getData() as RowData[]

  const filteredData = data.filter((row: RowData) => {
    return schemaFields.value.some(col => row[col])
  })

  if (filteredData.length === 0) {
    alert(t('Aucune donnée à télécharger. Veuillez remplir au moins une ligne.'))
    return
  }

  const header = schemaFields.value.map(col => escapeCsvValue(col)).join(',')
  const rows = filteredData.map((row: RowData) => {
    return schemaFields.value
      .map(col => escapeCsvValue(row[col]))
      .join(',')
  })

  const csv = [header, ...rows].join('\n')

  const downloadFileName = resourceTitle.value.endsWith('.csv') ? resourceTitle.value : `${resourceTitle.value || 'donnees'}.csv`

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', downloadFileName)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function generateFile() {
  if (!table) {
    customErrors.value = [t(`La table n'est pas initialisée`)]
    return
  }

  if (!resourceTitle.value || resourceTitle.value.trim() === '') {
    customErrors.value = [t('Veuillez saisir un titre pour la ressource')]
    return
  }

  const data = table.getData() as RowData[]
  const hasData = data.some((row: RowData) => {
    return schemaFields.value.some(col => row[col])
  })

  if (!hasData) {
    customErrors.value = [t('Veuillez saisir au moins une ligne de données')]
    return
  }

  customErrors.value = []

  const csvContent = generateCSV()

  const fileName = resourceTitle.value.endsWith('.csv') ? resourceTitle.value : `${resourceTitle.value}.csv`

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  uploadedFile.value = new File([blob], fileName, { type: 'text/csv;charset=utf-8;' })
}

defineExpose({ generateFile })

watch([tableRef, schemaFields], () => {
  if (tableRef.value && schemaFields.value.length > 0) {
    initializeTable()
  }
}, { immediate: true })

watch(validationReport, () => {
  if (validationReport.value && !validationReport.value.report?.valid && validationReport.value.report?.errors) {
    const errors = validationReport.value.report.errors

    for (const error of errors) {
      const rowIndex = error.rowNumber ? error.rowNumber - 2 : -1
      const columnName = error.fieldName

      if (rowIndex >= 0 && columnName && schemaFields.value.includes(columnName)) {
        const errorKey = `${rowIndex}_${columnName}`
        validationErrors.value[errorKey] = {
          title: error.title || 'Erreur',
          message: error.message || error.type || 'Erreur de validation',
        }
      }
    }
  }
  applyCellErrors()
})
</script>

<style>
.tabulator {
  background-color: transparent;
}

.tabulator .tabulator-tableholder {
  background-color: transparent;
}

/* Style pour les cellules en erreur */
.tabulator-cell.cell-error {
  background-color: var(--color-danger-dark) !important;
  color: var(--color-white) !important;
}

.tabulator-cell.cell-error:hover {
  background-color: var(--color-danger-dark) !important;
}

/* Style pour les en-têtes de colonne */
.tabulator .tabulator-header {
  background-color: var(--color-datagouv) !important;
  border-bottom: 2px solid var(--color-gray-title);
}

.tabulator .tabulator-col {
  background-color: var(--color-white) !important;
}

.tabulator .tabulator-col-title {
  font-weight: normal !important;
}

.tabulator .tabulator-header .tabulator-col-content {
  font-weight: normal !important;
}

/* Suppression de la bordure extérieure de la table */
.tabulator {
  border: 1px solid var(--color-gray-default) !important;
}

/* Bordures internes en gris clair */
.tabulator .tabulator-frozen.tabulator-frozen-left {
  border-right-width: 1px !important;
}

.tabulator .tabulator-cell {
  border-color: var(--color-gray-silver) !important;
}

.tabulator .tabulator-col {
  border-color: var(--color-gray-silver) !important;
}

.tabulator .tabulator-row {
  border-color: var(--color-gray-silver) !important;
}

.tabulator-row.tabulator-row-even {
  background-color: var(--color-gray-some) !important;
}

.tabulator-row.tabulator-selectable:hover {
  background-color: var(--color-gray-lower) !important;
}
</style>
