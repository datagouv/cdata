<template>
  <div class="flex">
    <Sidemenu
      class="w-5/12 hidden lg:block"
      :button-text="$t('Aide')"
      :on-right="true"
      :fixed="true"
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
          :id="nameDatasetAccordionId"
          :title="$t('Nommer son jeu de données')"
          :state="accordionState('title')"
        >
          <p class="fr-m-0">
            {{ $t("Le titre de votre jeu de données doit être le plus précis et spécifique possible. ") }} <br>
            {{ $t("Il doit également correspondre au vocabulaire employé par les utilisateurs.") }} <br>
            {{ $t("Ces derniers recherchent les données le plus souvent dans un moteur de recherche.") }}
          </p>
        </Accordion>
        <Accordion
          :id="addAcronymAccordionId"
          :title="$t('Ajouter un sigle au jeu de données')"
          :state="accordionState('acronym')"
        >
          <p class="fr-m-0">
            {{ $t("Vous avez la possibilité d’apposer un sigle à votre jeu de données. Les lettres qui composent ce sigle n’ont pas besoin d’être séparées par des points.") }}
          </p>
        </Accordion>
        <Accordion
          :id="writeAGoodDescriptionAccordionId"
          :title="$t('Écrire une bonne description')"
          :state="accordionState('description')"
        >
          <div class="prose prose-neutral m-0">
            <p class="m-0">
              {{ $t(`La description de votre jeu de données permet aux personnes qui le consultent d’obtenir des informations sur le contenu et la structure des ressources publiées, vous pouvez notamment renseigner :`) }}
            </p>
            <ul class="fr-mt-3v">
              <li>{{ $t("La liste des fichiers mis à disposition ;") }}</li>
              <li>{{ $t("La description du format des fichiers ;") }}</li>
              <li>{{ $t("La fréquence de mise à jour.") }}</li>
            </ul>
            <ul class="fr-mt-3v">
              <li>{{ $t("Les motivations pour la création du jeu de données ;") }}</li>
              <li>{{ $t("La composition du jeu de données ;") }}</li>
              <li>{{ $t("Le processus de collecte des données ;") }}</li>
              <li>{{ $t("Le pré-traitement des données ;") }}</li>
              <li>{{ $t("La diffusion du jeu de données ;") }}</li>
              <li>{{ $t("La maintenance du jeu de données ;") }}</li>
              <li>{{ $t("Les considérations légales et éthiques.") }}</li>
            </ul>
          </div>
        </Accordion>
        <Accordion
          :id="useTagsAccordionId"
          :title="$t('Mettre des mots-clés')"
          :state="accordionState('tags')"
        >
          <p class="fr-m-0">
            {{ $t("Les mots clés caractérisent votre jeu de données. Ils sont publics et apportent un meilleur référencement du jeu de données lors d’une recherche utilisateur.") }}
          </p>
        </Accordion>
        <Accordion
          :id="selectLicenseAccordionId"
          :title="$t('Sélectionner une licence')"
          :state="accordionState('license')"
        >
          <p class="fr-m-0">
            {{ $t("Les licences définissent les règles de réutilisation. En choisissant une licence de réutilisation, vous vous assurez que le jeu de données publié sera réutilisé selon les conditions d’usage que vous avez définies.") }}
          </p>
        </Accordion>
        <Accordion
          v-if="form.owned?.organization"
          :id="contactPointAccordionId"
          :title="$t('Définir un point de contact')"
          :state="accordionState('contact_points')"
        >
          <p class="fr-m-0">
            {{ $t("Spécifiez un point de contact, comme un email ou un lien vers un formulaire, pour que les utilisateurs puissent vous joindre en cas de problème ou pour poser des questions.") }}
          </p>
        </Accordion>
        <Accordion
          :id="chooseFrequencyAccordionId"
          :title="$t('Choisir la fréquence de mise à jour')"
          :state="accordionState('frequency')"
        >
          <p class="fr-m-0">
            {{ $t("La fréquence de mise à jour correspond à la fréquence à laquelle vous prévoyez de mettre à jour les données publiées. Cette fréquence de mise à jour reste indicative.") }}
          </p>
        </Accordion>
        <Accordion
          :id="addTemporalCoverageAccordionId"
          :title="$t('Renseigner la couverture temporelle')"
          :state="accordionState('temporal_coverage')"
        >
          <p class="fr-m-0">
            {{ $t("La couverture temporelle indique la portée dans le temps des données publiées.") }} <br>
            {{ $t("Par exemple : de 2012 à 2015.") }}
          </p>
        </Accordion>
        <Accordion
          :id="addSpatialInformationAccordionId"
          :title="$t('Compléter les informations spatiales')"
          :state="accordionState('spatial_granularity')"
        >
          <!-- TODO add spatial zones too -->
          <p class="fr-m-0">
            {{ $t("La granularité spatiale indique le niveau de détail géographique le plus fin que peut couvrir vos données.") }} <br>
            {{ $t("Par exemple : à l’échelle du département ou de la commune.") }}
          </p>
        </Accordion>
      </AccordionGroup>
    </Sidemenu>
    <div class="w-full lg:w-7/12">
      <div class="fr-p-3w bg-white">
        <SimpleBanner
          v-if="type === 'create'"
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
              {{ $t('Qu’est-ce qu’un jeu de données ?') }}
            </p>
            <p class="m-0 text-xs/5">
              {{ $t('Sur {site} un jeu de données est un ensemble de fichiers.', { site: config.public.title }) }}
            </p>
          </div>
        </SimpleBanner>

        <slot name="top" />

        <RequiredExplanation />
        <fieldset
          v-if="isGlobalAdmin && type === 'update'"
          class="fr-fieldset"
        >
          <legend
            id="featured-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t("Mis en avant") }}
            </h2>
          </legend>
          <ToggleSwitch
            v-model="form.featured"
            :label="$t('Mettre en avant')"
            @update:model-value="$emit('feature')"
          />
        </fieldset>
        <fieldset
          v-if="type === 'create'"
          class="fr-fieldset"
          aria-labelledby="description-legend"
        >
          <legend
            id="description-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t("Producteur") }}
            </h2>
          </legend>
          <div class="fr-fieldset__element">
            <ProducerSelect
              v-model="form.owned"
              :label="t(`Vérifiez l'identité avec laquelle vous souhaitez publier`)"
              :required="true"
              :error-text="getFirstError('owned')"
              :warning-text="getFirstWarning('owned')"
              :all="isMeAdmin()"
            />
          </div>
        </fieldset>
        <fieldset
          class="fr-fieldset min-width-0"
          aria-labelledby="description-legend"
        >
          <legend
            id="description-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t("Description") }}
            </h2>
          </legend>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="nameDatasetAccordionId"
            @blur="touch('title')"
          >
            <InputGroup
              v-model="form.title"
              class="mb-3"
              :aria-describedby="nameDatasetAccordionId"
              :label="$t('Titre')"
              :required="true"
              :has-error="!!getFirstError('title')"
              :has-warning="!!getFirstWarning('title')"
              :error-text="getFirstError('title')"
            />
            <SimpleBanner
              v-if="getFirstWarning('title')"
              type="warning"
            >
              {{ getFirstWarning("title") }}
            </SimpleBanner>
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addAcronymAccordionId"
            @blur="touch('acronym')"
          >
            <InputGroup
              v-model="form.acronym"
              :label="$t('Acronyme')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element min-width-0"
            :accordion="writeAGoodDescriptionAccordionId"
          >
            <InputGroup
              v-model="form.description"
              class="mb-3"
              :label="$t('Description')"
              :required="true"
              type="markdown"
              :has-error="!!getFirstError('description')"
              :has-warning="!!getFirstWarning('description')"
              :error-text="getFirstError('description')"
              @change="touch('description')"
            />
            <SimpleBanner
              v-if="getFirstWarning('description')"
              type="warning"
            >
              {{ getFirstWarning("description") }}
            </SimpleBanner>
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element min-width-0"
            :accordion="writeAGoodDescriptionAccordionId"
          >
            <InputGroup
              v-model="form.description_short"
              class="mb-3"
              :label="$t(`Description courte (optionnelle, ${DESCRIPTION_SHORT_MAX_LENGTH} caractères max)`)"
              :required="false"
              type="markdown"
              :has-error="!!getFirstError('description_short')"
              :has-warning="!!getFirstWarning('description_short')"
              :error-text="getFirstError('description_short')"
              @change="touch('description_short')"
            />
            <SimpleBanner
              v-if="getFirstWarning('description_short')"
              type="warning"
            >
              {{ getFirstWarning("description_short") }}
            </SimpleBanner>
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="useTagsAccordionId"
            @blur="touch('tags')"
          >
            <TagsSelect
              v-model="form.tags"
              class="mb-3"
              :error-text="getFirstError('tags')"
              :warning-text="getFirstWarning('tags')"
            />
            <SimpleBanner
              v-if="getFirstWarning('tags')"
              type="warning"
            >
              {{ getFirstWarning("tags") }}
            </SimpleBanner>
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="selectLicenseAccordionId"
            @blur="touch('license')"
          >
            <SearchableSelect
              v-model="form.license"
              :options="licenses"
              :label="t('Licence')"
              :placeholder="t('Sélectionnez une licence')"
              :display-value="(option) => option.title"
              :multiple="false"
              :group-by="(option) => option.group"
              :error-text="getFirstError('license')"
              :warning-text="getFirstWarning('license')"
            >
              <template #option="{ option, active }">
                <div class="w-full">
                  <div class="flex items-center justify-between space-x-2">
                    <div>{{ option.title }}</div>
                    <div
                      v-if="option.code"
                      class="font-mono  px-2 py-1 border border-transparent text-xs"
                      :class="{ 'bg-gray-100': ! active, 'border-white': active }"
                    >
                      {{ option.code }}
                    </div>
                  </div>
                  <div
                    v-if="option.recommended || option.description"
                    class="flex items-center justify-between space-x-2"
                    :class="{
                      'text-gray-500': !active,
                    }"
                  >
                    <div
                      v-if="option.recommended"
                      class="flex items-center space-x-1"
                    >
                      <RiStarFill
                        class="self-center size-3 "
                        :class="{ 'text-primary': !active }"
                        aria-hidden="true"
                      />
                      <span>{{ t('Recommandée') }}</span>
                    </div>
                    <div v-if="option.description">
                      {{ option.description }}
                    </div>
                  </div>
                </div>
              </template>
            </SearchableSelect>
            <SimpleBanner
              v-if="getFirstWarning('license')"
              type="warning"
            >
              {{ getFirstWarning('license') }}
            </SimpleBanner>
          </LinkedToAccordion>
        </fieldset>
        <fieldset
          v-if="form.owned?.organization"
          class="fr-fieldset"
          aria-labelledby="description-legend"
        >
          <legend
            id="description-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-0">
              {{ harvested ? t("Attributions et points de contact") : t("Points de contact") }}
            </h2>
          </legend>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="contactPointAccordionId"
          >
            <ContactPointSelect
              v-for="(contact_point, index) in form.contact_points"
              :key="contact_point && 'id' in contact_point ? contact_point.id : index"
              v-model="form.contact_points[index]"
              class="pt-3"
              :organization="form.owned?.organization"
              :show-attributions="harvested"
            />
            <ContactPointSelect
              v-if="form.contact_points.length === 0"
              v-model="form.contact_points[0]"
              class="pt-3"
              :organization="form.owned?.organization"
              :show-attributions="harvested"
            />
            <BrandedButton
              class="mt-4"
              type="button"
              color="primary-soft"
              size="xs"
              :icon="RiAddLine"
              @click="form.contact_points.push({ ...defaultContactForm })"
            >
              {{ harvested ? t('Nouvelle attribution') : t('Nouveau contact') }}
            </BrandedButton>
          </LinkedToAccordion>
        </fieldset>
        <fieldset
          class="fr-fieldset"
          aria-labelledby="time-legend"
        >
          <legend
            id="time-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t("Temps") }}
            </h2>
          </legend>
          <LinkedToAccordion
            :accordion="chooseFrequencyAccordionId"
            class="fr-fieldset__element"
            @blur="touch('frequency')"
          >
            <SearchableSelect
              v-model="form.frequency"
              class="mb-3"
              :label="$t('Fréquence de mise à jour')"
              :placeholder="$t('Recherchez une fréquence…')"
              :get-option-id="(frequency) => frequency.label"
              :display-value="(frequency) => frequency.label"
              :options="frequencies"
              :multiple="false"
              :required="true"
              :error-text="getFirstError('frequency')"
              :warning-text="getFirstWarning('frequency')"
            />
            <SimpleBanner
              v-if="getFirstWarning('frequency')"
              type="warning"
            >
              {{ getFirstWarning("frequency") }}
            </SimpleBanner>
          </LinkedToAccordion>
          <LinkedToAccordion
            :accordion="addTemporalCoverageAccordionId"
            class="fr-fieldset__element"
            @blur="touch('temporal_coverage')"
          >
            <p class="!mb-2">
              {{ $t('Couverture temporelle') }}
            </p>
            <div class="grid lg:grid-cols-2 gap-4">
              <InputGroup
                v-model="form.temporal_coverage.start"
                :label="$t('début')"
                type="date"
                :show-label-inside="true"
                :has-error="!!getFirstError('temporal_coverage')"
                :has-warning="!!getFirstWarning('temporal_coverage')"
                :error-text="getFirstError('temporal_coverage')"
              />
              <InputGroup
                v-model="form.temporal_coverage.end"
                :label="$t('fin')"
                type="date"
                :show-label-inside="true"
              />
            </div>
            <SimpleBanner
              v-if="getFirstWarning('temporal_coverage')"
              type="warning"
            >
              {{ getFirstWarning("temporal_coverage") }}
            </SimpleBanner>
          </LinkedToAccordion>
        </fieldset>
        <fieldset
          class="fr-fieldset"
          aria-labelledby="space-legend"
        >
          <legend
            id="space-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t("Spatiale") }}
            </h2>
          </legend>
          <LinkedToAccordion
            :accordion="addSpatialInformationAccordionId"
            class="fr-fieldset__element"
            @blur="touch('spatial_zones')"
          >
            <div class="fr-grid-row fr-grid-row--gutters">
              <div class="fr-col-12">
                <div>
                  <SearchableSelect
                    v-model="form.spatial_zones"
                    :label="$t('Couverture spatiale')"
                    :placeholder="$t('Rechercher une couverture spatiale…')"
                    :suggest="suggestSpatial"
                    :multiple="true"
                    class="!mb-0"

                    :error-text="getFirstError('spatial_zones')"
                    :warning-text="getFirstWarning('spatial_zones')"
                  >
                    <template #option="{ option: zone, active }">
                      <div class="w-full">
                        <div class="flex items-center justify-between space-x-2">
                          <div>{{ zone.name }}</div>
                          <div
                            class="font-mono  px-2 py-1 border border-transparent text-xs"
                            :class="{ 'bg-gray-100': ! active, 'border-white': active }"
                          >
                            Insee : {{ zone.code }}
                          </div>
                        </div>
                        <div
                          v-if="getGranularityName(zone)"
                          class="flex items-center justify-between space-x-2"
                          :class="{
                            'text-gray-500': !active,
                          }"
                        >
                          {{ getGranularityName(zone) }}
                        </div>
                      </div>
                    </template>
                  </SearchableSelect>
                  <div
                    v-if="form.spatial_zones.length"
                    class="mt-2 flex flex-wrap"
                  >
                    <button
                      v-for="zone in form.spatial_zones"
                      :key="zone.id"
                      class="fr-tag fr-tag--sm fr-tag--dismiss  mr-2 mb-2"
                      type="button"
                      @click="removeZone(zone)"
                    >
                      {{ zone.name }}
                    </button>
                  </div>
                </div>
              </div>
              <div class="fr-col-12">
                <SearchableSelect
                  v-model="form.spatial_granularity"
                  class="mb-3"
                  :label="$t('Granularité spatiale')"
                  :placeholder="$t('Chercher une granularité…')"
                  :get-option-id="(granularity) => granularity.id"
                  :display-value="(granularity) => granularity.name"
                  :options="granularities"
                  :multiple="false"

                  :error-text="getFirstError('spatial_granularity')"
                  :warning-text="getFirstWarning('spatial_granularity')"
                >
                  <template #option="{ option: granularity }">
                    {{ granularity.name }}
                  </template>
                </SearchableSelect>
                <SimpleBanner
                  v-if="getFirstWarning('spatial_granularity')"
                  type="warning"
                >
                  {{ getFirstWarning("spatial_granularity") }}
                </SimpleBanner>
              </div>
            </div>
          </LinkedToAccordion>
        </fieldset>
        <div
          class="fr-grid-row"
          :class="{ 'fr-grid-row--right': type === 'update', 'justify-between': type === 'create' }"
        >
          <BrandedButton
            v-if="type === 'create'"
            color="secondary"
            @click="$emit('previous')"
          >
            {{ $t('Précédent') }}
          </BrandedButton>
          <BrandedButton
            color="primary"
            @click="submit"
          >
            {{ submitLabel }}
          </BrandedButton>
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { SimpleBanner, type Frequency, type License } from '@datagouv/components-next'
import { RiAddLine, RiStarFill } from '@remixicon/vue'
import { computed } from 'vue'
import Accordion from '~/components/Accordion/Accordion.global.vue'
import AccordionGroup from '~/components/Accordion/AccordionGroup.global.vue'
import ToggleSwitch from '~/components/Form/ToggleSwitch.vue'
import ProducerSelect from '~/components/ProducerSelect.vue'
import SearchableSelect from '~/components/SearchableSelect.vue'
import type { DatasetForm, EnrichedLicense, SpatialGranularity, SpatialZone } from '~/types/types'
import { DESCRIPTION_SHORT_MAX_LENGTH, DESCRIPTION_MIN_LENGTH } from '~/utils/datasets'

const datasetForm = defineModel<DatasetForm>({ required: true })

const props = defineProps<{
  submitLabel: string
  type: 'create' | 'update'
  harvested?: boolean
}>()
const emit = defineEmits<{
  feature: []
  previous: []
  submit: []
}>()

const { t } = useI18n()
const config = useRuntimeConfig()

const user = useMe()
const isGlobalAdmin = computed(() => isAdmin(user.value))

const nameDatasetAccordionId = useId()
const addAcronymAccordionId = useId()
const writeAGoodDescriptionAccordionId = useId()
const useTagsAccordionId = useId()
const selectLicenseAccordionId = useId()
const contactPointAccordionId = useId()
const chooseFrequencyAccordionId = useId()
const addTemporalCoverageAccordionId = useId()
const addSpatialInformationAccordionId = useId()

const { data: frequencies } = await useAPI<Array<Frequency>>('/api/1/datasets/frequencies', { lazy: true })

const { data: allLicenses } = await useAPI<Array<License>>('/api/1/datasets/licenses', { lazy: true })

// Merge some information between database (all licenses) and config (selectable license, some recommanded, codes…)
// Maybe all these information could be better stored in database too…
const licenses = computed(() => {
  if (!allLicenses.value) return []

  const licenses = [] as Array<EnrichedLicense>
  const licensesChoices = config.public.licenses as unknown as Record<string, Array<{ value: string, recommended?: boolean, code?: string, description?: string }>>
  for (const [group, licensesInGroup] of Object.entries(licensesChoices)) {
    for (const license of licensesInGroup) {
      const found = allLicenses.value.find(({ id }) => license.value === id)
      if (!found) continue
      licenses.push({ ...found, ...license, group })
    }
  }
  return licenses
})

const suggestSpatial = async (query: string): Promise<Array<SpatialZone>> => {
  return await $api<Array<SpatialZone>>('/api/1/spatial/zones/suggest/', {
    query: {
      q: query,
      size: 5,
    },
  })
}

const { data: granularities } = await useAPI<Array<SpatialGranularity>>('/api/1/spatial/granularities/', { lazy: true })
const getGranularityName = (zone: SpatialZone): string | undefined => {
  if (!granularities.value) return ''
  return granularities.value.find(granularity => granularity.id === zone.level)?.name
}

const { $api } = useNuxtApp()

const removeZone = (zone: SpatialZone) => {
  form.value.spatial_zones = form.value.spatial_zones.filter(otherZone => otherZone.id !== zone.id)
}

const { form, touch, getFirstError, getFirstWarning, validate } = useForm(datasetForm, {
  owned: [required()],
  title: [required()],
  description: [required()],
  description_short: [],
  frequency: [required()],
  private: [],
}, {
  title: [testNotAllowed(config.public.demoServer?.name)],
  description: [minLength(DESCRIPTION_MIN_LENGTH, t(`Il est recommandé d'avoir une {property} d'au moins {min} caractères.`, { property: t('description'), min: DESCRIPTION_MIN_LENGTH }))],
  description_short: [maxLength(DESCRIPTION_SHORT_MAX_LENGTH, t(`La {property} ne doit pas dépasser {max} caractères.`, { property: t('description courte'), max: DESCRIPTION_SHORT_MAX_LENGTH }))],
  tags: [required(t('L\'ajout de mots-clés aide à améliorer le référencement de vos données.'))],
  license: [required()],
  frequency: [(f) => {
    if (f && f.id === 'unknown') return t('La fréquence doit être différente d\'inconnue.')
    return null
  }],
  spatial_granularity: [required(t('Vous n\'avez pas spécifié la granularité spatiale.'))],
  temporal_coverage: [required(t('Vous n\'avez pas fourni la couverture temporelle.'))],
})

onMounted(() => {
  if (props.type === 'update') validate()
})

const accordionState = (key: keyof typeof form.value) => {
  if (getFirstError(key)) return 'error'
  if (getFirstWarning(key)) return 'warning'

  return 'default'
}

async function submit() {
  if (await validate()) {
    emit('submit')
  }
};
</script>
