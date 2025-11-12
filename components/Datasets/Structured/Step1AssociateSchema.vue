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
      class="mb-0"
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
          class="fr-input mb-3"
          placeholder="Rechercher un schéma..."
          :disabled="loadingSchemas"
        >
        <p
          v-if="getFirstError('selectedSchema')"
          class="fr-error-text"
        >
          {{ getFirstError('selectedSchema') }}
        </p>
        <div v-if="searchQuery && filteredSchemas.length > 0">
          <p class="text-sm mb-4">
            {{ $t('{n} résultat trouvé | {n} résultats trouvés', { n: filteredSchemas.length }) }}
          </p>
          <div
            class="grid grid-cols-1 gap-4"
            role="listbox"
          >
            <SchemaCard
              v-for="schema in filteredSchemas"
              :key="schema.name"
              :schema
              class="cursor-pointer"
              :selectable="true"
              :selected="schema.name === form.selectedSchema?.name"
              @click="selectSchema(schema)"
            />
          </div>
        </div>

        <div v-if="searchQuery && filteredSchemas.length === 0 && !loadingSchemas">
          <SimpleBanner type="warning">
            {{ $t('Aucun schéma ne correspond à votre recherche.') }}
          </SimpleBanner>
        </div>
        <template #accordion>
          <HelpAccordion :title="$t(`Qu'est-ce qu'un schéma de données ?`)">
            <p class="m-0">
              {{ $t("Les schémas de données permettent de décrire des modèles de données : quels sont les différents champs, comment sont représentées les données, quelles sont les valeurs possibles etc.") }}
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>
    </FormFieldset>

    <!-- searchQuery is not saved between pages so this case will happen on "previous" -->
    <template v-if="!searchQuery && form.selectedSchema">
      <SchemaCard
        :schema="form.selectedSchema"
        class="cursor-pointer"
        :selectable="true"
        :selected="true"
      />
    </template>

    <div class="fr-grid-row fr-grid-row--right mt-5">
      <BrandedButton
        color="primary"
        :disabled="!canProceed"
        @click="submit"
      >
        {{ $t("Suivant") }}
      </BrandedButton>
    </div>
  </FormWithAccordions>
</template>

<script setup lang="ts">
import { BrandedButton, SchemaCard, SimpleBanner, useGetCatalog } from '@datagouv/components-next'
import type { Dataset, DatasetV2, RegisteredSchema } from '@datagouv/components-next'
import { ref, onMounted, computed } from 'vue'
import ProducerSelect from '~/components/ProducerSelect.vue'
import DatasetsSelect from '~/components/DatasetsSelect.vue'
import FieldsetElement from '~/components/Form/FieldsetElement.vue'
import HelpAccordion from '~/components/Form/HelpAccordion.vue'
import type { AssociateSchemaForm } from '~/types/schema'
import type { DatasetSuggest } from '~/types/types'

const emit = defineEmits<{
  next: []
}>()

const { t } = useTranslation()
const route = useRoute()
const getCatalog = useGetCatalog()
const { $api } = useNuxtApp()

const schemas = ref<Array<RegisteredSchema>>([])
const loadingSchemas = ref(false)
const searchQuery = ref('')

const schemaForm = defineModel<AssociateSchemaForm>({ required: true })
const publicationMode = defineModel<'new' | 'existing'>('publicationMode', { required: true })

const { form, formInfo, getFirstError, touch, validate } = useForm(schemaForm, {
  owned: [required()],
  selectedSchema: [required(t('Vous devez sélectionner un schéma'))],
})

const selectedDatasets = ref<Array<DatasetV2 | DatasetSuggest>>([])

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

const filteredSchemas = computed(() => schemas.value.filter((schema: RegisteredSchema) => {
  if (!searchQuery.value.trim()) {
    return false
  }
  const query = searchQuery.value.toLowerCase()
  const titleMatch = schema.title?.toLowerCase().includes(query)
  const descriptionMatch = schema.description?.toLowerCase().includes(query)
  return titleMatch || descriptionMatch
}))

async function selectSchema(schema: RegisteredSchema) {
  form.value.selectedSchema = schema
  touch('selectedSchema')
}

const canProceed = computed(() => {
  const hasBasicInfo = form.value.owned && form.value.selectedSchema

  // Si on ajoute à un dataset existant, il faut qu'un dataset soit sélectionné
  if (publicationMode.value === 'existing') {
    return hasBasicInfo && selectedDatasets.value.length > 0
  }

  return hasBasicInfo
})

async function submit() {
  if (await validate()) {
    if (publicationMode.value === 'existing' && selectedDatasets.value.length > 0) {
      const selectedDataset = selectedDatasets.value[0]
      form.value.existingDataset = await $api<Dataset>(`/api/1/datasets/${selectedDataset.id}/`)
    }

    emit('next')
  }
}

onMounted(() => {
  loadSchemas()
})
</script>
