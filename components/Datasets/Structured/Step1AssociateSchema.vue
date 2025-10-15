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
          :id="chooseProducerAccordionId"
          :title="$t('Choisir l\'identité sous laquelle vous souhaitez publier')"
          :state="accordionState('owned')"
          :opened="true"
        >
          <p class="fr-m-0">
            {{ $t("Choisissez si vous souhaitez publier au nom de l'organisation ou en votre nom. Nous vous conseillons de publier sous le nom d'une organisation s'il s'agit d'une activité professionnelle.") }}
          </p>
        </Accordion>
        <Accordion
          :id="selectSchemaAccordionId"
          :title="$t('Qu\'est-ce qu\'un schéma de données ?')"
          :state="accordionState('selectedSchema')"
        >
          <p class="fr-m-0">
            {{ $t("Les schémas de données permettent de décrire des modèles de données : quels sont les différents champs, comment sont représentées les données, quelles sont les valeurs possibles etc.") }}
          </p>
        </Accordion>
      </AccordionGroup>
    </Sidemenu>
    <div class="w-full lg:w-7/12">
      <div class="fr-p-3w bg-white">
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

        <fieldset
          class="fr-fieldset"
          aria-labelledby="producer-legend"
        >
          <legend
            id="producer-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t("Producteur") }}
            </h2>
          </legend>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="chooseProducerAccordionId"
          >
            <ProducerSelect
              v-model="form.owned"
              :label="t(`Vérifiez l'identité avec laquelle vous souhaitez publier`)"
              :required="true"
              :error-text="getFirstError('owned')"
              :all="isMeAdmin()"
            />
          </LinkedToAccordion>
        </fieldset>

        <fieldset
          class="fr-fieldset fr-mt-4w"
          aria-labelledby="schema-legend"
        >
          <legend
            id="schema-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t("Schéma de données") }}
            </h2>
          </legend>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="selectSchemaAccordionId"
          >
            <label
              class="fr-label"
              for="schema-search"
            >
              {{ $t('Rechercher un schéma') }} <Required :required="true" />
            </label>
            <input
              id="schema-search"
              v-model="searchQuery"
              type="text"
              class="fr-input"
              :placeholder="loadingSchemas ? 'Chargement...' : 'Saisissez un mot-clé...'"
              :disabled="loadingSchemas"
              @input="onSearchChange"
            >
            <p
              v-if="getFirstError('selectedSchema')"
              class="fr-error-text"
            >
              {{ getFirstError('selectedSchema') }}
            </p>
          </LinkedToAccordion>

          <div
            v-if="searchQuery && filteredSchemas.length > 0"
            class="fr-mt-3w"
          >
            <p class="fr-text--sm fr-mb-2w">
              {{ filteredSchemas.length }} {{ $t('résultat(s) trouvé(s)') }}
            </p>
            <div class="fr-grid-row fr-grid-row--gutters">
              <div
                v-for="schema in filteredSchemas"
                :key="schema.name"
                class="fr-col-12"
              >
                <div
                  class="fr-card fr-card--sm"
                  :class="{ 'fr-card--selected': form.selectedSchema === schema.name }"
                  style="cursor: pointer"
                  @click="selectSchema(schema)"
                >
                  <div class="fr-card__body">
                    <div class="fr-card__content">
                      <h3 class="fr-card__title fr-mb-1w">
                        {{ schema.title }}
                      </h3>
                      <div class="fr-mb-1w">
                        <span
                          v-for="label in schema.labels"
                          :key="label"
                          class="fr-badge fr-badge--sm fr-badge--info fr-mr-1v"
                        >
                          {{ label }}
                        </span>
                        <span class="fr-badge fr-badge--sm fr-badge--new">
                          {{ schema.schema_type }}
                        </span>
                      </div>
                      <p class="fr-card__desc fr-text--sm fr-m-0">
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
            class="fr-mt-3w"
          >
            <SimpleBanner type="warning">
              {{ $t('Aucun schéma ne correspond à votre recherche.') }}
            </SimpleBanner>
          </div>

          <div
            v-if="form.selectedSchema && selectedSchemaDetails"
            class="fr-mt-3w"
          >
            <SimpleBanner type="primary">
              <div class="fr-grid-row">
                <div class="fr-col-12">
                  <p class="fr-m-0 fr-text--bold fr-mb-1w">
                    ✓ {{ $t('Schéma sélectionné :') }} {{ selectedSchemaDetails.title }}
                  </p>
                  <p
                    v-if="schemaDetails && schemaDetails.fields"
                    class="fr-m-0 fr-text--sm"
                  >
                    <strong>{{ $t('Nombre de colonnes :') }}</strong> {{ schemaDetails.fields.length }}
                  </p>
                </div>
              </div>
            </SimpleBanner>
          </div>
        </fieldset>

        <div class="fr-grid-row fr-grid-row--right fr-mt-4w">
          <BrandedButton
            color="primary"
            :disabled="!canProceed"
            @click="submit"
          >
            {{ $t("Suivant") }}
          </BrandedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner } from '@datagouv/components-next'
import { ref, onMounted, computed } from 'vue'
import ProducerSelect from '~/components/ProducerSelect.vue'
import type { DatasetForm } from '~/types/types'

interface SchemaVersion {
  version_name: string
  schema_url: string
}

interface Schema {
  name: string
  title: string
  description: string
  schema_type: string
  schema_url: string
  labels?: string[]
  versions?: SchemaVersion[]
}

interface SchemaField {
  name: string
  description?: string
  type: string
  [key: string]: unknown
}

interface SchemaDetails {
  name: string
  title: string
  description: string
  fields: SchemaField[]
  [key: string]: unknown
}

const emit = defineEmits<{
  (e: 'next'): void
}>()

const { t } = useI18n()
const route = useRoute()

const chooseProducerAccordionId = useId()
const selectSchemaAccordionId = useId()

const schemas = ref<Schema[]>([])
const loadingSchemas = ref(false)
const schemaDetails = ref<SchemaDetails | null>(null)
const searchQuery = ref('')
const filteredSchemas = ref<Schema[]>([])

const STRUCTURED_STATE = 'structured-step1'

const form = useState(STRUCTURED_STATE, () => ({
  owned: null,
  selectedSchema: '',
  schemaUrl: '',
}))

const selectedSchemaDetails = computed(() => {
  if (!form.value.selectedSchema) return null
  return schemas.value.find(s => s.name === form.value.selectedSchema)
})

async function loadSchemas() {
  loadingSchemas.value = true
  try {
    const response = await fetch('https://schema.data.gouv.fr/schemas.json')
    const data = await response.json() as { schemas: Schema[] }
    schemas.value = data.schemas || []

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
  filteredSchemas.value = schemas.value.filter((schema: Schema) => {
    const titleMatch = schema.title?.toLowerCase().includes(query)
    const descriptionMatch = schema.description?.toLowerCase().includes(query)
    return titleMatch || descriptionMatch
  })
}

async function selectSchema(schema: Schema) {
  form.value.selectedSchema = schema.name
  form.value.schemaUrl = schema.schema_url

  const schemaTypeState = useState<string>('structured-schema-type', () => '')
  schemaTypeState.value = schema.schema_type

  try {
    const response = await fetch(schema.schema_url)
    schemaDetails.value = await response.json() as SchemaDetails
  }
  catch (error) {
    console.error('Erreur lors du chargement du schéma:', error)
  }
}

const { getFirstError, validate } = useForm(form, {
  owned: [required()],
  selectedSchema: [required(t('Vous devez sélectionner un schéma'))],
})

const canProceed = computed(() => {
  return form.value.owned && form.value.selectedSchema && schemaDetails.value
})

const accordionState = (key: keyof typeof form.value) => {
  if (getFirstError(key)) return 'error'
  return 'default'
}

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
    }

    emit('next')
  }
}

onMounted(() => {
  loadSchemas()
})
</script>
