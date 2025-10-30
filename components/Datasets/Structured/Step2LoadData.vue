<template>
  <FormWithAccordions :form-info>
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
            <template v-if="isTableschema">
              {{ $t(`Vous pouvez soit importer un fichier existant, soit utiliser l'outil tableur pour créer vos données.`) }}
            </template>
            <template v-else>
              {{ $t('Importez un fichier existant conforme au schéma sélectionné.') }}
            </template>
          </p>
        </div>
      </SimpleBanner>
      <FormFieldset :legend="$t('Charger et vérifier un fichier existant')">
        <FieldsetElement form-key="resources">
          <FileCard
            v-for="(_, index) in resources"
            :key="index"
            v-model="resources[index]"
            class="fr-mb-3v"
            :extensions
            :show-edit-and-warning="!isTableschema"
            @delete="removeFile(index)"
          />
          <UploadGroup
            v-if="resources.length === 0 || !isTableschema"
            :label="resources.length === 0 ? $t('Charger et vérifier un fichier existant') : $t('Ajouter un autre fichier')"
            type="drop"
            :accept="acceptedFileTypes"
            :hint-text="$t('Taille max : 420 Mo.')"
            @change="handleFileUpload"
          />
          <template #accordion>
            <HelpAccordion :title="$t('Importer un fichier')">
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
            </HelpAccordion>
          </template>
        </FieldsetElement>
      </FormFieldset>

      <Divider
        v-if="isTableschema"
        class="-mt-3 mb-5"
      >
        {{ $t('ou') }}
      </Divider>

      <FormFieldset
        v-if="isTableschema"
        :legend="$t('Saisir vos données')"
      >
        <FieldsetElement form-key="useSpreadsheet">
          <PaddedContainer color="alt-grey">
            <p class="text-sm mb-4">
              {{ $t(`Utilisez l'outil tableur pour créer vos données directement en ligne avec les colonnes du schéma sélectionné.`) }}
            </p>
            <div class="text-center">
              <BrandedButton
                color="primary"
                :icon="RiTableLine"
                @click="selectSpreadsheet"
              >
                {{ $t(`Utiliser l'outil tableur`) }}
              </BrandedButton>
            </div>
          </PaddedContainer>
          <template #accordion>
            <HelpAccordion :title="$t(`Utiliser l'outil tableur`)">
              <div class="prose prose-neutral fr-m-0">
                <p class="fr-m-0 fr-mb-1w">
                  {{ $t("L'outil tableur vous permet de créer vos données directement en ligne, utiliser les colonnes du schéma sélectionné et valider vos données avant publication") }}
                </p>
              </div>
            </HelpAccordion>
          </template>
        </FieldsetElement>
      </FormFieldset>

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
          :loading="isLoading"
          color="primary"
          @click="submit"
        >
          {{ publicationMode === 'existing' ? $t("Publier") : $t("Suivant") }}
        </BrandedButton>
      </div>
    </PaddedContainer>
  </FormWithAccordions>
</template>

<script setup lang="ts">
import { BrandedButton, getSchemaVersion, PaddedContainer, SimpleBanner, type RegisteredSchema, type SchemaPublicationMode } from '@datagouv/components-next'
import { RiTableLine } from '@remixicon/vue'
import FieldsetElement from '~/components/Form/FieldsetElement.vue'
import HelpAccordion from '~/components/Form/HelpAccordion.vue'
import type { ResourceForm } from '~/types/types'

const props = defineProps<{
  schema: RegisteredSchema | null
  publicationMode: SchemaPublicationMode
}>()

const emit = defineEmits<{
  previous: []
  next: []
  openSheet: [file?: File]
}>()

const { isLoading } = useLoadingIndicator()
const resources = defineModel<Array<ResourceForm>>('resources', { required: true })
const useSpreadsheet = defineModel<boolean>('useSpreadsheet', { required: true })

const key = '/api/1/datasets/extensions/'

const { data: extensions } = await useAPI<Array<string>>(key, {
  key: key,
  getCachedData: getDataFromSSRPayload,
})

const { t } = useTranslation()

const schemaVersion = computed(() => getSchemaVersion(props.schema))

const isTableschema = computed(() => props.schema?.schema_type === 'tableschema')

const { formInfo, touch } = useForm({
  resources,
  useSpreadsheet,
}, {
  resources: [],
}, {})

function selectSpreadsheet() {
  useSpreadsheet.value = true
  resources.value = []
  touch('useSpreadsheet')

  emit('openSheet')
}

function addResourceForms(resourceForms: Array<ResourceForm>) {
  for (const resourceForm of resourceForms) {
    resources.value.push(resourceForm)
  }
  useSpreadsheet.value = false
  touch('resources')
}

function removeFile(position: number) {
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

async function handleFileUpload(files: Array<File>) {
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
      schema: props.schema?.name && schemaVersion.value
        ? {
            name: props.schema.name,
            url: null,
            version: schemaVersion.value,
          }
        : null,
      schema_url: null,
      checksum_type: null,
      checksum_value: null,
    })
  }

  addResourceForms(resourceForms)
  customErrors.value = []
}

async function submit() {
  const validationMessage = isTableschema.value
    ? t(`Vous devez soit importer un fichier, soit utiliser l'outil tableur.`)
    : t('Vous devez importer un fichier.')

  if (!useSpreadsheet.value && resources.value.length === 0) {
    customErrors.value = [validationMessage]
    return
  }

  customErrors.value = []

  if (resources.value.length > 0) {
    const firstResource = resources.value[0]
    if (firstResource.filetype === 'file' && 'file' in firstResource && firstResource.file) {
      if (isTableschema.value) {
        emit('openSheet', firstResource.file.raw)
        return
      }
      else {
        emit('next')
        return
      }
    }
  }

  emit('next')
}
</script>
