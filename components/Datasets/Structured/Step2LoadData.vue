<template>
  <div class="flex">
    <Sidemenu
      class="w-5/12 hidden lg:block"
      :button-text="$t('Aide')"
      :on-right="true"
      :fixed="true"
      :show-border="false"
    >
      <template #title>
        <span
          class="fr-icon--sm fr-icon-question-line"
          aria-hidden="true"
        />
        {{ $t('Aide') }}
      </template>
      <AccordionGroup :with-icon="true">
        <Accordion
          :id="uploadFileAccordionId"
          :title="$t('Importer un fichier')"
          :opened="true"
        >
          <div class="prose prose-neutral fr-m-0">
            <p class="fr-m-0 fr-mb-1w">
              {{ $t("Vous pouvez importer un fichier existant aux formats suivants :") }}
            </p>
            <ul>
              <li>{{ $t("CSV (recommandé)") }}</li>
              <li>{{ $t("Excel (XLS, XLSX)") }}</li>
              <li>{{ $t("ODS") }}</li>
            </ul>
          </div>
        </Accordion>
        <Accordion
          :id="useSpreadsheetAccordionId"
          :title="$t('Utiliser l\'outil tableur')"
        >
          <div class="prose prose-neutral fr-m-0">
            <p class="fr-m-0 fr-mb-1w">
              {{ $t("L'outil tableur vous permet de créer vos données directement en ligne, utiliser les colonnes du schéma sélectionné et valider vos données avant publication") }}
            </p>
          </div>
        </Accordion>
      </AccordionGroup>
    </Sidemenu>
    <div class="w-full lg:w-7/12">
      <PaddedContainer>
        <SimpleBanner
          type="primary"
          class="mb-4 flex items-center space-x-5"
        >
          <NuxtImg
            src="/illustrations/edit.svg"
            loading="lazy"
            class="size-14 shrink-0"
            alt=""
          />
          <div class="w-full">
            <p class="font-bold mb-1">
              {{ $t('Comment souhaitez-vous ajouter vos données ?') }}
            </p>
            <p class="m-0 text-xs/5">
              {{ $t('Vous pouvez soit importer un fichier existant, soit utiliser l\'outil tableur pour créer vos données.') }}
            </p>
          </div>
        </SimpleBanner>

        <fieldset
          class="fr-fieldset min-width-0"
          aria-labelledby="upload-legend"
        >
          <legend
            id="upload-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t("Charger et vérifier un fichier existant") }}
            </h2>
          </legend>
          <LinkedToAccordion
            class="fr-fieldset__element min-width-0"
            :accordion="uploadFileAccordionId"
          >
            <PaddedContainer
              v-if="resources.length === 0"
              class="flex flex-col items-center"
              color="alt-grey"
            >
              <h3 class="fr-text--md fr-text--bold fr-m-0 fr-mb-2w">
                {{ $t("Ajoutez votre fichier") }}
              </h3>
              <label
                for="file-upload-direct"
                class="fr-btn fr-btn--secondary"
                style="cursor: pointer"
              >
                <span
                  class="fr-icon-upload-line fr-mr-1w"
                  aria-hidden="true"
                />
                {{ $t('Parcourir') }}
              </label>
              <input
                id="file-upload-direct"
                type="file"
                style="display: none"
                :accept="acceptedFileTypes"
                multiple
                @change="handleFileUpload"
              >
            </PaddedContainer>
            <template v-else>
              <FileCard
                v-for="(_, index) in resources"
                :key="index"
                v-model="resources[index]"
                class="fr-mb-3v"
                :extensions
                @delete="removeFile(index)"
              />
              <div class="fr-grid-row fr-grid-row--center fr-mt-2w">
                <label
                  for="file-upload-additional"
                  class="fr-btn fr-btn--secondary fr-btn--sm"
                  style="cursor: pointer"
                >
                  <span
                    class="fr-icon-add-line fr-mr-1w"
                    aria-hidden="true"
                  />
                  {{ $t('Ajouter un autre fichier') }}
                </label>
                <input
                  id="file-upload-additional"
                  type="file"
                  style="display: none"
                  :accept="acceptedFileTypes"
                  multiple
                  @change="handleFileUpload"
                >
              </div>
            </template>
          </LinkedToAccordion>
        </fieldset>

        <!-- Grand séparateur OU -->
        <div
          class="fr-my-6w"
          style="position: relative; text-align: center;"
        >
          <hr style="border: 0; border-top: 1px #e5e5e5;">
          <span
            style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 0 20px; font-weight: bold; font-size: 1.2rem; color: #666;"
          >
            {{ $t('OU') }}
          </span>
        </div>

        <!-- Section Tableur -->
        <fieldset
          class="fr-fieldset min-width-0"
          aria-labelledby="spreadsheet-legend"
        >
          <legend
            id="spreadsheet-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t("Saisir vos données") }}
            </h2>
          </legend>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="useSpreadsheetAccordionId"
          >
            <PaddedContainer
              class="flex flex-col items-center"
              color="alt-grey"
            >
              <p class="fr-text--sm fr-mb-2w text-center">
                {{ $t('Utilisez l\'outil tableur pour créer vos données directement en ligne avec les colonnes du schéma sélectionné.') }}
              </p>
              <BrandedButton
                color="primary"
                @click="selectSpreadsheet"
              >
                <span
                  class="fr-icon-table-line fr-mr-1w"
                  aria-hidden="true"
                />
                {{ $t('Utiliser l\'outil tableur') }}
              </BrandedButton>
            </PaddedContainer>
          </LinkedToAccordion>
        </fieldset>

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
            @click="$emit('previous')"
          >
            {{ $t("Précédent") }}
          </BrandedButton>
          <BrandedButton
            :loading
            color="primary"
            @click="submit"
          >
            {{ $t("Suivant") }}
          </BrandedButton>
        </div>
      </PaddedContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner } from '@datagouv/components-next'
import type { ResourceForm } from '~/types/types'

const props = defineProps<{
  loading: boolean
  resources: Array<ResourceForm>
  useSpreadsheet: boolean
  schemaFields: string[]
}>()

const emit = defineEmits<{
  'previous': []
  'next': []
  'update:resources': [value: Array<ResourceForm>]
  'update:useSpreadsheet': [value: boolean]
  'update:schemaFields': [value: string[]]
}>()

const resources = computed({
  get: () => props.resources,
  set: value => emit('update:resources', value),
})

const useSpreadsheet = computed({
  get: () => props.useSpreadsheet,
  set: value => emit('update:useSpreadsheet', value),
})

const { data: extensions } = await useAPI<Array<string>>('/api/1/datasets/extensions/')

const { t } = useI18n()

const uploadFileAccordionId = useId()
const useSpreadsheetAccordionId = useId()

const { touch } = useForm({
  resources: props.resources,
  useSpreadsheet: props.useSpreadsheet,
}, {
  resources: [],
}, {})

const selectSpreadsheet = () => {
  useSpreadsheet.value = true
  resources.value = []
  touch('useSpreadsheet')

  navigateTo({ path: '/admin/datasets/structured', query: { step: '2-sheet' } })
}

const addResourceForms = (resourceForms: Array<ResourceForm>) => {
  for (const resourceForm of resourceForms) resources.value.push(resourceForm)
  useSpreadsheet.value = false
  touch('resources')
}

const removeFile = (position: number) => {
  resources.value.splice(position, 1)
  touch('resources')
}

const acceptedFileTypes = computed(() => {
  if (!extensions.value) return '.csv,.xls,.xlsx,.ods'
  return extensions.value
    .filter(ext => ['csv', 'xls', 'xlsx', 'ods'].includes(ext))
    .map(ext => `.${ext}`)
    .join(',')
})

const customErrors = ref<string[]>([])

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const files = Array.from(input.files)
  const resourceForms: Array<ResourceForm> = []

  for (const file of files) {
    resourceForms.push({
      resource: null,
      title: file.name,
      type: 'main',
      file: {
        raw: file,
        state: { status: 'waiting' },
      },
      description: '',
      filetype: 'file',
      schema: null,
      schema_url: null,
      checksum_type: null,
      checksum_value: null,
    })
  }

  addResourceForms(resourceForms)
  customErrors.value = []

  input.value = ''
}

const submit = async () => {
  if (!useSpreadsheet.value && resources.value.length === 0) {
    customErrors.value = [t('Vous devez soit importer un fichier, soit utiliser l\'outil tableur.')]
    return
  }

  customErrors.value = []

  if (resources.value.length > 0) {
    const firstResource = resources.value[0]
    if (firstResource.filetype === 'file' && 'file' in firstResource && firstResource.file) {
      const uploadedFileState = useState<File | null>('structured-uploaded-file', () => null)
      uploadedFileState.value = firstResource.file.raw

      navigateTo({ path: '/admin/datasets/structured', query: { step: '2-sheet' } })
      return
    }
  }

  emit('next')
}
</script>
