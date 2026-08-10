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

      <Disclosure
        v-if="statusActionType"
        v-slot="{ open }"
        as="template"
      >
        <BannerAction
          :type="statusActionType"
          class="mb-4"
        >
          <template #title>
            <DisclosureButton
              v-if="detailedErrors.length"
              class="flex items-center gap-1 text-left"
            >
              {{ statusMessage }}
              <RiArrowDownSLine
                class="size-4 shrink-0 transition-transform"
                :class="{ 'rotate-180': open }"
              />
            </DisclosureButton>
            <template v-else>
              {{ statusMessage }}
            </template>
          </template>

          {{ unrecognizedColumnsMessage }}

          <DisclosurePanel class="fr-table mt-1">
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
                  v-for="(error, index) in detailedErrors"
                  :key="index"
                >
                  <td class="tabular-nums">
                    {{ error.rowNumber ? error.rowNumber - 1 : '-' }}
                  </td>
                  <td>{{ error.fieldName || error.fieldNumber || '-' }}</td>
                  <td>{{ error.title || error.type }}</td>
                  <td>{{ error.message }}</td>
                </tr>
              </tbody>
            </table>
            <p
              v-if="hiddenErrorsCount"
              class="mt-2"
            >
              {{ $t(`Seules les {n} premières erreurs sont affichées.`, { n: MAX_LISTED_ERRORS }) }}
            </p>
          </DisclosurePanel>

          <template #button>
            <BrandedButton
              color="secondary"
              size="xs"
              @click="$emit('changeSchema')"
            >
              {{ $t('Changer de schéma') }}
            </BrandedButton>
          </template>
        </BannerAction>
      </Disclosure>

      <SimpleBanner
        v-else
        :type="statusBannerType"
        class="mb-4"
      >
        <p class="mb-0">
          {{ statusMessage }}
        </p>
        <p
          v-if="unrecognizedColumnsMessage"
          class="mb-0 mt-1 text-sm"
        >
          {{ unrecognizedColumnsMessage }}
        </p>
      </SimpleBanner>

      <div ref="tableRef" />

      <div class="mt-2 flex flex-wrap items-center gap-4">
        <BrandedButton
          color="secondary"
          :icon="RiAddLine"
          size="xs"
          @click="addRow"
        >
          {{ $t('Ajouter une ligne') }}
        </BrandedButton>
        <p class="text-xs text-gray-medium mb-0">
          {{ $t(`Clic droit dans le tableau pour dupliquer ou supprimer une ligne.`) }}
        </p>
      </div>
    </div>
    <SimpleBanner
      v-if="customErrors.length"
      type="danger"
      class="my-4"
    >
      <p class="font-bold mb-1">
        {{ $t("Une erreur est survenue | Des erreurs sont survenues", customErrors.length) }}
      </p>
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
import { BannerAction, BrandedButton, escapeCsvValue, SimpleBanner, type RegisteredSchema, type SchemaDetails, type SchemaField } from '@datagouv/components-next'
import { RiAddLine, RiArrowDownSLine, RiCheckLine, RiDownloadLine } from '@remixicon/vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { ofetch } from 'ofetch'
import paparse from 'papaparse'
import { TabulatorFull as Tabulator, type CellComponent, type Editor, type Formatter, type GlobalTooltipOption, type RowComponent } from 'tabulator-tables'
import type { ValidationReport } from '~/types/schema'

const MAX_LISTED_ERRORS = 50

interface RowData {
  [key: string]: string | number | null | undefined
}

const props = defineProps<{
  schema: RegisteredSchema | null
  schemaDetails?: SchemaDetails | null
}>()

defineEmits<{
  changeSchema: []
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

// Headers of the imported file. Only the schema fields are displayed and exported,
// so anything else is dropped and the user must be told about it.
const fileColumns = ref<Array<string>>([])

const unrecognizedColumns = computed(() => fileColumns.value.filter(column => !schemaFields.value.includes(column)))

// Not a single column in common: the file was made for another schema, so its rows hold
// nothing the table can show
const hasSchemaMismatch = computed(() => fileColumns.value.length > 0 && unrecognizedColumns.value.length === fileColumns.value.length)

const unrecognizedColumnsMessage = computed(() => {
  if (!unrecognizedColumns.value.length) return null

  // The names themselves stay out of the banner: the count is what tells the user the
  // schema may be wrong, and the report below already details each column
  return t(
    `{unrecognized} des {total} colonnes de votre fichier sont inconnues du schéma « {schema} » et ne seront pas conservées.`,
    {
      unrecognized: unrecognizedColumns.value.length,
      total: fileColumns.value.length,
      schema: props.schemaDetails?.title ?? '',
    },
  )
})

const hasNoErrors = computed(() => {
  if (!validationReport.value) return false
  const errorCount = validationReport.value.report?.errors?.length || 0
  return errorCount === 0
})

const errorRowsCount = computed(() => new Set((validationReport.value?.report?.errors ?? []).map(error => error.rowNumber)).size)

const statusMessage = computed(() => {
  if (validating.value) return t('Validation de vos données en cours…')
  if (!validationReport.value) return t(`Validez vos données pour pouvoir continuer.`)
  if (hasNoErrors.value) {
    return t(`Vos données sont conformes au schéma. {n} ligne traitée. | Vos données sont conformes au schéma. {n} lignes traitées.`, {
      n: validationReport.value.report?.stats?.rows_processed ?? 0,
    })
  }
  const errorsCount = validationReport.value.report?.errors?.length ?? 0
  return t(`{errors} erreurs sur {n} ligne. Corrigez-les pour pouvoir continuer. | {errors} erreurs sur {n} lignes. Corrigez-les pour pouvoir continuer.`, {
    errors: errorsCount,
    n: errorRowsCount.value,
  })
})

const statusBannerType = computed(() => {
  if (validating.value || !validationReport.value) return 'gray'
  return hasNoErrors.value ? 'success' : 'danger'
})

// As soon as something is wrong, changing the schema is worth offering: two schemas can
// share most of their column names, so no ratio of unknown columns tells them apart
const statusActionType = computed(() => {
  if (detailedErrors.value.length) return 'danger'
  if (unrecognizedColumns.value.length) return 'warning'
  return null
})

const allErrors = computed(() => validationReport.value?.report?.errors ?? [])
const detailedErrors = computed(() => (hasNoErrors.value ? [] : allErrors.value.slice(0, MAX_LISTED_ERRORS)))
const hiddenErrorsCount = computed(() => allErrors.value.length - detailedErrors.value.length)

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

async function makeTable(data: Array<RowData>, shouldValidate = false) {
  if (!tableRef.value) {
    return
  }

  table?.destroy()

  table = new Tabulator(tableRef.value, {
    data: data,
    layout: 'fitData',
    nestedFieldSeparator: false,
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

type ParsedFile = { columns: Array<string>, rows: Array<RowData> }

function readDelimitedText(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    paparse.parse<RowData, File>(file, {
      header: true,
      // A trailing newline otherwise counts as a row when guessing the delimiter,
      // which makes tab separated files with two columns fall back to the comma
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('PapaParse a rencontré des avertissements:', results.errors)
        }
        resolve({ columns: results.meta.fields ?? [], rows: results.data })
      },
      error: reject,
    })
  })
}

async function readSpreadsheet(file: File): Promise<ParsedFile> {
  // Loaded on demand: this is a heavy dependency and most files are CSV
  const { read, utils } = await import('@e965/xlsx')

  // `cellDates` turns dates into their own cell type, so anything still numeric below
  // is a plain number
  const workbook = read(await file.arrayBuffer(), { type: 'array', cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) {
    return { columns: [], rows: [] }
  }

  // Cells are read as the text the spreadsheet displays, which keeps `01004` and dates
  // intact but renders long numbers as `8.69084E+12` under the General format. Numbers
  // are therefore rewritten from their raw value, leaving dates to their format.
  for (const address of Object.keys(sheet)) {
    if (address.startsWith('!')) continue
    const cell = sheet[address]
    if (cell.t === 'n' && cell.v != null) cell.w = String(cell.v)
  }

  const [columns = []] = utils.sheet_to_json<Array<string>>(sheet, { header: 1, raw: false, blankrows: false })
  return { columns, rows: utils.sheet_to_json<RowData>(sheet, { raw: false, defval: '' }) }
}

// Two parsers on purpose, even though SheetJS also reads CSV. It only returns the
// expected values when asked for the formatted text of each cell, which is a
// conversion round trip: with the raw ones a date becomes an Excel serial number and
// `01004` loses its zero. It also needs the whole file in memory, where PapaParse
// streams it and never converts anything, which the announced 420 MB limit relies on.
const SPREADSHEET_EXTENSIONS = ['xlsx', 'xls', 'ods']

async function loadUploadedFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''

  try {
    const { columns, rows } = SPREADSHEET_EXTENSIONS.includes(extension)
      ? await readSpreadsheet(file)
      : await readDelimitedText(file)

    fileColumns.value = columns

    // Keeping the rows when nothing matches would only fill the table with as many
    // blank lines as the file had, and validating them says nothing useful either
    if (hasSchemaMismatch.value) {
      makeTable(createEmptyRows(1))
      return
    }

    makeTable(rows.map((row, index) => ({ id: index, ...row })), true)
  }
  catch (error) {
    console.error('Erreur lors du chargement du fichier:', error)
    customErrors.value = [t('Ce fichier n’a pas pu être lu. Vérifiez qu’il s’agit bien d’un fichier CSV, Excel ou ODS.')]
    makeTable(createEmptyRows(1))
  }
}

const stopInit = watchEffect(() => {
  if (!tableRef.value || schemaFields.value.length === 0) return

  stopInit()

  if (uploadedFile.value) {
    loadUploadedFile(uploadedFile.value)
  }
  else {
    makeTable(createEmptyRows(1))
  }
}, { flush: 'post' })

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
