<template>
  <div>
    <PaddedContainer>
      <SimpleBanner
        type="primary"
        class="mb-4 flex items-center space-x-5"
      >
        <NuxtImg
          src="/illustrations/notebook.svg"
          loading="lazy"
          class="size-14 shrink-0"
          alt=""
        />
        <div class="w-full">
          <p class="font-bold mb-1">
            {{ $t('Saisissez vos données') }}
          </p>
          <p class="m-0 text-xs/5">
            {{ $t('Utilisez le tableur pour saisir vos données conformément au schéma sélectionné.') }}
          </p>
        </div>
      </SimpleBanner>

      <div v-if="schemaFields.length === 0">
        <Alert type="warning">
          {{ $t('Aucun schéma n\'a été sélectionné. Veuillez retourner à l\'étape précédente.') }}
        </Alert>
      </div>

      <div v-else>
        <div class="fr-mb-3w">
          <p class="fr-text--sm fr-mb-1w">
            <strong>{{ $t('Schéma utilisé :') }}</strong> {{ schemaDetails?.title || $t('Non défini') }}
          </p>
        </div>

        <div class="fr-mb-3w">
          <InputGroup
            v-model="resourceTitle"
            :label="t('Titre de la ressource')"
            :required="true"
            placeholder="donnees-schema"
          />
        </div>

        <div
          class="fr-mb-2w"
          style="display: flex; gap: 12px; flex-wrap: wrap;"
        >
          <BrandedButton
            color="secondary"
            @click="showAddColumnModal = true"
          >
            <span
              class="fr-icon-add-line fr-mr-1w"
              aria-hidden="true"
            />
            {{ $t('Ajouter une colonne') }}
          </BrandedButton>
          <BrandedButton
            color="secondary"
            @click="downloadCSV"
          >
            <span
              class="fr-icon-download-line fr-mr-1w"
              aria-hidden="true"
            />
            {{ $t('Télécharger en CSV') }}
          </BrandedButton>
        </div>

        <div ref="tableRef" />

        <div style="margin-top: 8px;">
          <BrandedButton
            color="secondary"
            @click="addRow"
          >
            <span
              class="fr-icon-add-line fr-mr-1w"
              aria-hidden="true"
            />
            {{ $t('Ajouter une ligne') }}
          </BrandedButton>
        </div>
      </div>

      <br>
      <div
        v-if="validationReport"
        class="fr-mb-3w"
      >
        <h3 class="fr-h5 fr-mb-2w">
          {{ $t('Rapport de validation') }}
        </h3>

        <Alert
          v-if="hasNoErrors"
          type="success"
          class="fr-mb-2w"
        >
          <template #title>
            {{ $t('✓ Validation réussie') }}
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
        </Alert>

        <Alert
          v-else
          type="error"
          class="fr-mb-2w"
        >
          <template #title>
            {{ $t('Validation échouée') }}
          </template>
          <p class="fr-m-0 fr-mb-2w">
            {{ validationReport.report?.errors?.length || 0 }} {{ $t('erreur(s) détectée(s)') }}
          </p>
          <p
            v-if="validationReport.report?.stats"
            class="fr-m-0 fr-text--sm"
          >
            {{ validationReport.report.stats.rows_processed }} {{ $t('lignes traitées') }}
          </p>
        </Alert>

        <div v-if="!hasNoErrors && validationReport.report?.errors && validationReport.report.errors.length > 0">
          <AccordionGroup :with-icon="false">
            <Accordion
              :title="$t('Voir le rapport d\'erreur détaillé')"
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
      <Alert
        v-if="customErrors.length"
        type="error"
        class="fr-mt-2w fr-mb-2w"
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
        <p v-else>
          {{ customErrors[0] }}
        </p>
      </Alert>

      <div class="fr-grid-row justify-between fr-mt-4w">
        <BrandedButton
          color="secondary"
          @click="goBack"
        >
          {{ $t("Retour") }}
        </BrandedButton>
        <div style="display: flex; gap: 12px;">
          <BrandedButton
            color="primary"
            :loading="validating"
            @click="validateData"
          >
            <span
              class="fr-icon-check-line fr-mr-1w"
              aria-hidden="true"
            />
            {{ $t('Valider les données') }}
          </BrandedButton>
          <BrandedButton
            color="primary"
            :disabled="!validationReport || !hasNoErrors"
            @click="submit"
          >
            {{ publicationMode === 'existing' ? $t("Publier") : $t("Suivant") }}
          </BrandedButton>
        </div>
      </div>
    </PaddedContainer>

    <Modal
      :opened="showAddColumnModal"
      :title="$t('Ajouter une colonne')"
      size="sm"
      @close="closeAddColumnModal"
    >
      <InputGroup
        v-model="newColumnName"
        :label="$t('Nom de la colonne')"
        :required="true"
        :has-error="!!columnNameError"
        :error-text="columnNameError"
        :placeholder="$t('Ex: ma_nouvelle_colonne')"
      />

      <template #footer>
        <div class="w-full flex justify-end space-x-4">
          <BrandedButton
            color="secondary"
            @click="closeAddColumnModal"
          >
            {{ $t("Annuler") }}
          </BrandedButton>
          <BrandedButton
            color="primary"
            @click="confirmAddColumn"
          >
            {{ $t("Ajouter") }}
          </BrandedButton>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, PaddedContainer, SimpleBanner, type RegisteredSchema, type SchemaDetails, type SchemaField } from '@datagouv/components-next'
import { ref, onMounted, nextTick, computed } from 'vue'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import type { CellComponent, RowComponent } from 'tabulator-tables'
import Alert from '~/components/Alert/Alert.vue'
import Modal from '~/components/Modal/Modal.client.vue'
import InputGroup from '~/components/InputGroup/InputGroup.vue'
import type { ResourceForm } from '~/types/types'
import 'tabulator-tables/dist/css/tabulator.min.css'
import { computedAsync } from '@vueuse/core'
import { ofetch } from 'ofetch'

interface RowData {
  [key: string]: string | number | null | undefined
}

interface ValidationError {
  title: string
  message: string
  type: string
  rowNumber: number
  fieldName?: string
  fieldNumber?: number
  cell?: string
}

interface ValidationReport {
  valid: boolean
  report?: {
    errors?: ValidationError[]
    warnings?: string[]
    stats?: {
      errors: number
      warnings: number
      rows_processed: number
    }
  }
}

const props = defineProps<{
  schema: RegisteredSchema
}>()

const emit = defineEmits<{
  (e: 'previous' | 'next'): void
}>()

const { t } = useTranslation()
const route = useRoute()

const SCHEMA_FIELDS_STATE = 'structured-schema-fields'
const schemaFields = useState<string[]>(SCHEMA_FIELDS_STATE, () => [])

const schemaDetails = computedAsync(async () => {
  return await ofetch<SchemaDetails>(props.schema.schema_url)
})

const SCHEMA_VERSION_STATE = 'structured-schema-version'
const schemaVersion = useState<string>(SCHEMA_VERSION_STATE, () => '')

const publicationMode = useState<'new' | 'existing'>('structured-publication-mode', () => 'new')

const UPLOADED_FILE_STATE = 'structured-uploaded-file'
const uploadedFile = useState<File | null>(UPLOADED_FILE_STATE, () => null)

const tableRef = ref<HTMLElement | null>(null)
let table: Tabulator | null = null

const customErrors = ref<string[]>([])

const validating = ref(false)
const validationReport = ref<ValidationReport | null>(null)

const resourceTitle = ref<string>('')

const showAddColumnModal = ref(false)
const newColumnName = ref('')
const columnNameError = ref('')

// Structure pour stocker les erreurs de validation
// Format: { "rowIndex_columnField": { title: string, message: string } }
const validationErrors = ref<Record<string, { title: string, message: string }>>({})

const hasNoErrors = computed(() => {
  if (!validationReport.value) return false
  const errorCount = validationReport.value.report?.errors?.length || 0
  return errorCount === 0
})

function cellTooltip(_e: MouseEvent, cell: CellComponent): string | undefined {
  const row = cell.getRow()
  const rowIndex = row.getPosition() - 1
  const field = cell.getField()
  const errorKey = `${rowIndex}_${field}`

  if (validationErrors.value[errorKey]) {
    const error = validationErrors.value[errorKey]
    return `<b>${error.title}</b><br>${error.message}`
  }

  return undefined
}

function getFieldDescription(fieldName: string): string {
  if (!schemaDetails.value || !schemaDetails.value.fields) {
    return t('Aucune description disponible')
  }

  const field = schemaDetails.value.fields.find((f: SchemaField) => f.name === fieldName)
  return field?.description || t('Aucune description disponible')
}

function getColumns() {
  const rowNumberColumn = {
    title: '',
    field: '_rowNumber',
    formatter: 'rownum',
    width: 60,
    hozAlign: 'center' as const,
    headerSort: false,
    frozen: true,
  }

  const dataColumns = schemaFields.value.map(field => ({
    title: field,
    field: field,
    editor: 'input',
    resizable: true,
    minWidth: 200,
    tooltip: cellTooltip,
    headerSort: false,
    headerMenu: [
      {
        label: '<strong>' + t('Description') + '</strong>',
        disabled: true,
      },
      {
        label: getFieldDescription(field),
        disabled: true,
      },
    ],
  }))

  return [rowNumberColumn, ...dataColumns]
}

function applyCellErrors() {
  if (!table) return

  const rows = table.getRows()
  rows.forEach((row: RowComponent) => {
    const rowIndex = row.getPosition() - 1

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
  })
}

function createEmptyRows(count = 10): RowData[] {
  const rows: RowData[] = []
  for (let i = 0; i < count; i++) {
    const row: RowData = {}
    schemaFields.value.forEach((col) => {
      row[col] = ''
    })
    rows.push(row)
  }
  return rows
}

async function parseCSV(file: File): Promise<RowData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) {
        reject(new Error('Fichier vide'))
        return
      }

      const lines = text.split('\n').filter(line => line.trim())
      if (lines.length === 0) {
        resolve([])
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))

      const data: RowData[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const row: RowData = {}

        schemaFields.value.forEach((field, _index) => {
          const headerIndex = headers.indexOf(field)
          row[field] = headerIndex >= 0 && headerIndex < values.length ? values[headerIndex] : ''
        })

        data.push(row)
      }

      resolve(data)
    }

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'))
    }

    reader.readAsText(file, 'UTF-8')
  })
}

async function initializeTable() {
  await nextTick()

  if (!tableRef.value) {
    console.error('tableRef.value est null')
    return
  }

  let tableData: RowData[] = []
  let shouldValidate = false

  if (uploadedFile.value) {
    try {
      tableData = await parseCSV(uploadedFile.value)
      shouldValidate = true
      uploadedFile.value = null
    }
    catch (error) {
      console.error('Erreur lors du chargement du fichier:', error)
      customErrors.value = [t('Erreur lors du chargement du fichier CSV')]
      tableData = createEmptyRows(10)
    }
  }
  else {
    tableData = createEmptyRows(10)
  }

  table = new Tabulator(tableRef.value, {
    data: tableData,
    layout: 'fitData',
    columns: getColumns(),
    rowContextMenu: [
      {
        label: t('Ajouter une ligne'),
        action: function (_e: MouseEvent, _row: RowComponent) {
          addRow()
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

function closeAddColumnModal() {
  showAddColumnModal.value = false
  newColumnName.value = ''
  columnNameError.value = ''
}

function confirmAddColumn() {
  const columnName = newColumnName.value.trim()

  if (!columnName) {
    columnNameError.value = t('Le nom de la colonne est obligatoire')
    return
  }

  if (schemaFields.value.includes(columnName)) {
    columnNameError.value = t('Une colonne avec ce nom existe déjà')
    return
  }

  schemaFields.value.push(columnName)

  if (table) {
    const data = table.getData() as RowData[]
    data.forEach((row: RowData) => {
      row[columnName] = ''
    })

    table.setColumns(getColumns())
    table.setData(data)

    setTimeout(() => applyCellErrors(), 100)
  }

  closeAddColumnModal()
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

    if (!props.schema.schema_url) {
      customErrors.value = [t(`L'URL du schéma est introuvable. Veuillez retourner à l'étape 1.`)]
      validating.value = false
      return
    }

    const csvContent = generateCSV()

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const formData = new FormData()
    formData.append('file', blob, 'data.csv')
    formData.append('schema', props.schema.schema_url)

    const response = await fetch('https://api.validata.etalab.studio/validate', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const result = await response.json()
    validationReport.value = result

    if (!result.valid && result.report?.errors) {
      const errors = result.report.errors

      errors.forEach((error: ValidationError) => {
        const rowIndex = error.rowNumber ? error.rowNumber - 2 : -1
        const columnName = error.fieldName

        if (rowIndex >= 0 && columnName && schemaFields.value.includes(columnName)) {
          const errorKey = `${rowIndex}_${columnName}`
          validationErrors.value[errorKey] = {
            title: error.title || 'Erreur',
            message: error.message || error.type || 'Erreur de validation',
          }
        }
      })

      applyCellErrors()
    }
  }
  catch (error) {
    console.error('Erreur lors de la validation:', error)
    customErrors.value = [t('Erreur lors de la validation des données. Veuillez réessayer.')]
  }
  finally {
    validating.value = false
  }
}

function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function downloadCSV() {
  if (!table) {
    alert(t('La table n\'est pas encore chargée'))
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

const goBack = () => {
  navigateTo({ path: route.path, query: { step: 2 } })
}

const submit = async () => {
  if (!table) {
    customErrors.value = [t('La table n\'est pas initialisée')]
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
  const file = new File([blob], fileName, { type: 'text/csv;charset=utf-8;' })

  const DATASET_FILES_STATE = 'structured-dataset-files'
  const resources = useState<Array<ResourceForm>>(DATASET_FILES_STATE, () => [])

  const resourceForm: ResourceForm = {
    resource: null,
    title: resourceTitle.value,
    type: 'main',
    file: {
      raw: file,
      state: { status: 'waiting' },
    },
    description: t('Données saisies via le tableur'),
    filetype: 'file' as const,
    schema: props.schema
      ? {
          name: props.schema.name,
          url: null,
          version: schemaVersion.value,
        }
      : null,
    schema_url: null,
    checksum_type: null,
    checksum_value: null,
  }

  if (resources.value.length > 0) {
    resources.value[0] = resourceForm
  }
  else {
    resources.value.push(resourceForm)
  }

  emit('next')
}

onMounted(() => {
  // Initialiser le titre de la ressource avec le format "donnees-nom-schema"
  if (!resourceTitle.value && props.schema.name) {
    const schemaShortName = props.schema.name.split('/').pop() || 'schema'
    resourceTitle.value = `donnees-${schemaShortName}`
  }
  else if (!resourceTitle.value) {
    resourceTitle.value = 'donnees'
  }

  if (schemaFields.value.length > 0) {
    initializeTable()
  }
})
</script>

<style scoped>
:deep(.tabulator) {
  background-color: transparent;
}

:deep(.tabulator .tabulator-tableholder) {
  background-color: transparent;
}

/* Style pour les cellules en erreur */
:deep(.tabulator-cell.cell-error) {
  background-color: #CE0500 !important;
  color: white !important;
}

:deep(.tabulator-cell.cell-error:hover) {
  background-color: #CE0500 !important;
}

/* Style pour les en-têtes de colonne */
:deep(.tabulator .tabulator-header) {
  background-color: var(--color-datagouv) !important;
}

:deep(.tabulator .tabulator-col) {
  background-color: var(--color-datagouv) !important;
}

:deep(.tabulator .tabulator-col-title) {
  color: white !important;
  font-weight: bold !important;
}

:deep(.tabulator .tabulator-header .tabulator-col-content) {
  color: white !important;
  font-weight: bold !important;
}

/* Suppression de la bordure extérieure de la table */
:deep(.tabulator) {
  border-top: none !important;
  border-left: 1px solid #DDDDDD !important;
  border-right: 1px solid #DDDDDD !important;
  border-bottom: 1px solid #DDDDDD !important;
}

/* Bordures internes en gris clair */
:deep(.tabulator .tabulator-cell) {
  border-color: #DDDDDD !important;
}

:deep(.tabulator .tabulator-col) {
  border-color: #DDDDDD !important;
}

:deep(.tabulator .tabulator-row) {
  border-color: #DDDDDD !important;
}

/* Correction de la bordure doublée pour la colonne row number */
:deep(.tabulator .tabulator-cell:first-child) {
  border-right: 1px solid #DDDDDD !important;
}

:deep(.tabulator .tabulator-col:first-child) {
  border-right: 1px solid #DDDDDD !important;
}
</style>
