<template>
  <FormWithAccordions
    :form-info
    @submit.prevent="submit"
  >
    <SimpleBanner
      type="primary"
      class="mb-4 flex items-center space-x-5"
    >
      <NuxtImg
        src="/illustrations/schema.svg"
        loading="lazy"
        class="size-14 shrink-0"
        alt=""
      />
      <div class="w-full">
        <p class="font-bold mb-1">
          {{ $t('Publication structurée') }}
        </p>
        <p class="m-0 text-xs/5">
          {{ $t('Sélectionnez le producteur et le schéma de données que vous souhaitez utiliser pour structurer votre jeu de données.') }}
        </p>
      </div>
    </SimpleBanner>

    <RequiredExplanation />

    <FormFieldset
      :legend="$t('Producteur')"
    >
      <FieldsetElement form-key="owned">
        <ProducerSelect
          v-model="form.owned"
          :label="t(`Sélectionnez votre organisation`)"
          :required="true"
          :organizations-only="true"
          :error-text="getFirstError('owned')"
          @update:model-value="touch('owned')"
        />
        <template #accordion>
          <HelpAccordion :title="$t(`Choisir l'organisation sous laquelle vous souhaitez publier`)">
            <p class="m-0 mb-4">
              {{ $t("La publication avec un schéma doit obligatoirement se faire au nom d'une organisation. Sélectionnez une organisation dont vous êtes membre.") }}
            </p>
            <p class="m-0">
              {{ $t("Si votre organisation n'existe pas encore, vous devez d'abord") }}
              <NuxtLink
                to="/admin/organizations/new/"
                class="link"
                target="_blank"
              >
                {{ $t("la créer ici") }}
              </NuxtLink>.
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>
    </FormFieldset>

    <FormFieldset
      v-if="form.owned"
      :legend="$t('Où souhaitez-vous publier vos données ?')"
    >
      <FieldsetElement form-key="existingDataset">
        <div class="flex gap-8 items-start">
          <div class="fr-checkbox-group m-0">
            <input
              id="mode-new"
              type="checkbox"
              :checked="publicationMode === 'new'"
              @change="publicationMode = 'new'"
            >
            <label
              class="fr-label"
              for="mode-new"
            >
              {{ $t("Créer un nouveau jeu de données") }}
            </label>
          </div>
          <div class="fr-checkbox-group m-0">
            <input
              id="mode-existing"
              type="checkbox"
              :checked="publicationMode === 'existing'"
              @change="publicationMode = 'existing'"
            >
            <label
              class="fr-label"
              for="mode-existing"
            >
              {{ $t("Ajouter à un jeu de données existant") }}
            </label>
          </div>
        </div>
        <br>
        <div
          v-if="publicationMode === 'existing'"
          class="fr-mt-3w"
        >
          <DatasetsSelect
            v-model="selectedDatasets"
            :label="t('Sélectionnez un jeu de données')"
            :single="true"
            :organization-id="organizationId"
          />
        </div>
      </FieldsetElement>
    </FormFieldset>

    <FormFieldset
      :legend="$t('Schéma de données')"
    >
      <FieldsetElement form-key="selectedSchema">
        <label
          class="fr-label"
          for="schema-search"
        >
          {{ $t('Rechercher un schéma') }} <Required :required="true" />
        </label>
        <input
          id="schema-search"
          v-model="searchQuery"
          type="search"
          class="fr-input"
          placeholder="Rechercher un schéma..."
          :disabled="loadingSchemas"
          @input="onSearchChange"
        >
        <p
          v-if="getFirstError('selectedSchema')"
          class="fr-error-text"
        >
          {{ getFirstError('selectedSchema') }}
        </p>
        <template #accordion>
          <HelpAccordion :title="$t(`Qu'est-ce qu'un schéma de données ?`)">
            <p class="m-0">
              {{ $t("Les schémas de données permettent de décrire des modèles de données : quels sont les différents champs, comment sont représentées les données, quelles sont les valeurs possibles etc.") }}
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>
      <div
        v-if="form.selectedSchema && selectedSchemaDetails"
        class="mt-2 w-full"
      >
        <SimpleBanner
          type="primary"
          class="w-full"
        >
          <div class="w-full">
            <p class="m-0 text-bold mb-2">
              {{ $t('Schéma sélectionné :') }} {{ selectedSchemaDetails.title }}
            </p>
            <p
              v-if="schemaDetails && schemaDetails.fields"
              class="m-0 text-sm"
            >
              <strong>{{ $t('Nombre de colonnes :') }}</strong> {{ schemaDetails.fields.length }}
            </p>
          </div>
        </SimpleBanner>
      </div>
    </FormFieldset>

    <div class="fr-grid-row fr-grid-row--right mt-5">
      <BrandedButton
        color="primary"
        :disabled="!canProceed"
        @click="submit"
      >
        {{ $t("Suivant") }}
      </BrandedButton>
    </div>

    <div
      v-if="searchQuery && filteredSchemas.length > 0"
      class="mt-4"
    >
      <p class="text-sm mb-4">
        {{ $t('{n} résultat trouvé | {n} résultats trouvés', { n: filteredSchemas.length }) }}
      </p>
      <div class="grid grid-cols-1 gap-4">
        <div
          v-for="schema in filteredSchemas"
          :key="schema.name"
        >
          <div
            class="fr-card fr-card--sm"
            :class="{ 'fr-card--selected': form.selectedSchema === schema.name }"
            style="cursor: pointer"
            @click="selectSchema(schema)"
          >
            <div class="fr-card__body">
              <div class="fr-card__content">
                <h3 class="fr-card__title mb-2">
                  {{ schema.title }}
                </h3>
                <div class="fr-mb-1w">
                  <span
                    v-for="label in schema.labels"
                    :key="label"
                    class="fr-badge fr-badge--sm fr-badge--info mr-1"
                  >
                    {{ label }}
                  </span>
                  <span class="fr-badge fr-badge--sm fr-badge--new">
                    {{ schema.schema_type }}
                  </span>
                </div>
                <p class="fr-card__desc fr-text--sm m-0">
                  {{ schema.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="searchQuery && filteredSchemas.length === 0 && !loadingSchemas"
      class="mt-5"
    >
      <SimpleBanner type="warning">
        {{ $t('Aucun schéma ne correspond à votre recherche.') }}
      </SimpleBanner>
    </div>
  </FormWithAccordions>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner, useGetCatalog } from '@datagouv/components-next'
import type { DatasetV2, RegisteredSchema, SchemaDetails, SchemaField } from '@datagouv/components-next'
import { ref, onMounted, computed } from 'vue'
import ProducerSelect from '~/components/ProducerSelect.vue'
import DatasetsSelect from '~/components/DatasetsSelect.vue'
import type { DatasetForm } from '~/types/types'
import FieldsetElement from '~/components/Form/FieldsetElement.vue'
import HelpAccordion from '~/components/Form/HelpAccordion.vue'

const emit = defineEmits<{
  (e: 'next'): void
}>()

const { t } = useTranslation()
const route = useRoute()
const getCatalog = useGetCatalog()

const schemas = ref<RegisteredSchema[]>([])
const loadingSchemas = ref(false)
const schemaDetails = ref<SchemaDetails | null>(null)
const searchQuery = ref('')
const filteredSchemas = ref<RegisteredSchema[]>([])

const STRUCTURED_STATE = 'structured-step1'

const form = useState(STRUCTURED_STATE, () => ({
  owned: null,
  existingDataset: null,
  selectedSchema: '',
  schemaUrl: '',
}))

const { formInfo, getFirstError, touch, validate } = useForm(form, {
  owned: [required()],
  selectedSchema: [required(t('Vous devez sélectionner un schéma'))],
})

const publicationMode = ref<'new' | 'existing'>('new')
const selectedDatasets = ref<DatasetV2[]>([])

const organizationId = computed(() => {
  const owned = form.value.owned
  if (!owned) return undefined
  // Check if owned has organization property and it's not null
  if ('organization' in owned) {
    const org = (owned as { organization: { id: string } | null }).organization
    return org?.id
  }
  return undefined
})

const selectedSchemaDetails = computed(() => {
  if (!form.value.selectedSchema) return null
  return schemas.value.find(s => s.name === form.value.selectedSchema)
})

async function loadSchemas() {
  loadingSchemas.value = true
  try {
    const data = await getCatalog()
    schemas.value = data || []

    const schemaParam = route.query.schema as string
    if (schemaParam) {
      const schemaToSelect = schemas.value.find(s => s.name === schemaParam)
      if (schemaToSelect) {
        await selectSchema(schemaToSelect)
        searchQuery.value = schemaToSelect.title
        onSearchChange()
      }
    }
  }
  catch (error) {
    console.error('Erreur lors du chargement des schémas:', error)
  }
  finally {
    loadingSchemas.value = false
  }
}

function onSearchChange() {
  if (!searchQuery.value.trim()) {
    filteredSchemas.value = []
    return
  }

  const query = searchQuery.value.toLowerCase()
  filteredSchemas.value = schemas.value.filter((schema: RegisteredSchema) => {
    const titleMatch = schema.title?.toLowerCase().includes(query)
    const descriptionMatch = schema.description?.toLowerCase().includes(query)
    return titleMatch || descriptionMatch
  })
}

async function selectSchema(schema: RegisteredSchema) {
  form.value.selectedSchema = schema.name
  form.value.schemaUrl = schema.schema_url

  const schemaTypeState = useState<string>('structured-schema-type', () => '')
  schemaTypeState.value = schema.schema_type

  const schemaNameState = useState<string>('structured-schema-name', () => '')
  const schemaVersionState = useState<string>('structured-schema-version', () => '')

  schemaNameState.value = schema.name

  if (schema.versions && schema.versions.length > 0) {
    schemaVersionState.value = schema.versions[schema.versions.length - 1].version_name
  }
  else {
    const versionMatch = schema.schema_url.match(/\/(\d+\.\d+\.\d+)\//)
    schemaVersionState.value = versionMatch ? versionMatch[1] : ''
  }

  try {
    const response = await fetch(schema.schema_url)
    schemaDetails.value = await response.json() as SchemaDetails
    touch('selectedSchema')
  }
  catch (error) {
    console.error('Erreur lors du chargement du schéma:', error)
  }
}

const canProceed = computed(() => {
  const hasBasicInfo = form.value.owned && form.value.selectedSchema && schemaDetails.value

  // Si on ajoute à un dataset existant, il faut qu'un dataset soit sélectionné
  if (publicationMode.value === 'existing') {
    return hasBasicInfo && selectedDatasets.value.length > 0
  }

  return hasBasicInfo
})

async function submit() {
  if (await validate()) {
    if (schemaDetails.value && schemaDetails.value.fields) {
      const schemaFieldsState = useState<string[]>('structured-schema-fields', () => [])
      schemaFieldsState.value = schemaDetails.value.fields.map((field: SchemaField) => field.name)

      const schemaDetailsState = useState<SchemaDetails | null>('structured-schema-details', () => null)
      schemaDetailsState.value = schemaDetails.value

      const datasetFormState = useState<Partial<DatasetForm>>('structured-dataset-form', () => ({}))
      if (datasetFormState.value) {
        datasetFormState.value.owned = form.value.owned
      }

      const publicationModeState = useState<'new' | 'existing'>('structured-publication-mode', () => 'new')
      publicationModeState.value = publicationMode.value

      if (publicationMode.value === 'existing' && selectedDatasets.value.length > 0) {
        const existingDatasetState = useState<DatasetV2 | null>('structured-existing-dataset', () => null)
        const selectedDataset = selectedDatasets.value[0]

        if ('resources' in selectedDataset && typeof selectedDataset.resources === 'object' && 'rel' in selectedDataset.resources) {
          const { $api } = useNuxtApp()
          existingDatasetState.value = await $api<DatasetV2>(`/api/1/datasets/${selectedDataset.id}/`)
        }
        else {
          existingDatasetState.value = selectedDataset
        }
      }
    }

    emit('next')
  }
}

onMounted(() => {
  loadSchemas()
})
</script>
