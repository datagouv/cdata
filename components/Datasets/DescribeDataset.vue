<template>
  <div class="flex">
    <Sidemenu
      class="w-5/12 hidden lg:block"
      :button-text="$t('Help')"
      :on-right="true"
      :fixed="true"
    >
      <template #title>
        <span
          class="fr-icon--sm fr-icon-question-line"
          aria-hidden="true"
        />
        {{ $t('Help') }}
      </template>
      <AccordionGroup :with-icon="true">
        <Accordion
          :id="nameDatasetAccordionId"
          :title="$t('Naming your dataset')"
          :state="accordionState('title')"
        >
          <p class="fr-m-0">
            {{ $t("The title of your dataset should be as precise and specific as possible.") }} <br>
            {{ $t("It should also correspond to the vocabulary used by users.") }} <br>
            {{ $t("They often search for data in a search engine.") }}
          </p>
        </Accordion>
        <Accordion
          :id="addAcronymAccordionId"
          :title="$t('Add an acronym to the dataset')"
          :state="accordionState('acronym')"
        >
          <p class="fr-m-0">
            {{ $t("You have the option to add an acronym to your dataset. The letters that make up this acronym do not need to be separated by periods.") }}
          </p>
        </Accordion>
        <Accordion
          :id="writeAGoodDescriptionAccordionId"
          :title="$t('Write a good description')"
          :state="accordionState('description')"
        >
          <div class="prose prose-neutral m-0">
            <p class="m-0">
              {{ $t(`The description of your dataset allows to obtain information about the content and structure of the published resources. You can provide:`) }}
            </p>
            <ul class="fr-mt-3v">
              <li>{{ $t("A list of the files available ;") }}</li>
              <li>{{ $t("A description of the file format ;") }}</li>
              <li>{{ $t("The update frequency.") }}</li>
            </ul>
            <ul class="fr-mt-3v">
              <li>{{ $t("Motivations for creating the dataset ;") }}</li>
              <li>{{ $t("The composition of the dataset ;") }}</li>
              <li>{{ $t("The data collection process ;") }}</li>
              <li>{{ $t("Data preprocessing ;") }}</li>
              <li>{{ $t("Dataset dissemination ;") }}</li>
              <li>{{ $t("Dataset maintenance ;") }}</li>
              <li>{{ $t("Legal and ethical considerations.") }}</li>
            </ul>
            <SimpleBanner
              v-if="getFirstWarning('description')"
              class="font-bold mt-2"
              type="warning"
            >
              {{ getFirstWarning("description") }}
            </SimpleBanner>
          </div>
        </Accordion>
        <Accordion
          :id="useTagsAccordionId"
          :title="$t('Use tags')"
          :state="accordionState('tags')"
        >
          <p class="fr-m-0">
            {{ $t("Tags characterize your dataset. They are public and improve the dataset's search engine optimization during a user search.") }}
          </p>
          <SimpleBanner
            v-if="getFirstWarning('tags')"
            class="font-bold mt-2"
            type="warning"
          >
            {{ getFirstWarning("tags") }}
          </SimpleBanner>
        </Accordion>
        <Accordion
          :id="selectLicenseAccordionId"
          :title="$t('Select a license')"
          :state="accordionState('license')"
        >
          <p class="fr-m-0">
            {{ $t("Licenses define the rules for reuse. By choosing a reuse license, you ensure that the published dataset will be reused according to the usage conditions you have defined.") }}
          </p>
          <SimpleBanner
            v-if="getFirstWarning('license')"
            class="font-bold mt-2"
            type="warning"
          >
            {{ getFirstWarning('license') }}
          </SimpleBanner>
        </Accordion>
        <Accordion
          v-if="form.owned?.organization"
          :id="contactPointAccordionId"
          :title="$t('Define a point of contact')"
          :state="accordionState('contact_points')"
        >
          <p class="fr-m-0">
            {{ $t("Specify a contact point, such as an email or a link to a form, so users can reach you in case of issues or for questions.") }}
          </p>
        </Accordion>
        <Accordion
          :id="chooseFrequencyAccordionId"
          :title="$t('Choose the update frequency')"
          :state="accordionState('frequency')"
        >
          <p class="fr-m-0">
            {{ $t("The update frequency corresponds to how often you plan to update the published data. This update frequency is only indicative.") }}
          </p>
          <SimpleBanner
            v-if="getFirstWarning('frequency')"
            class="font-bold mt-2"
            type="warning"
          >
            {{ getFirstWarning("frequency") }}
          </SimpleBanner>
        </Accordion>
        <Accordion
          :id="addTemporalCoverageAccordionId"
          :title="$t('Provide the temporal coverage')"
          :state="accordionState('temporal_coverage')"
        >
          <p class="fr-m-0">
            {{ $t("The temporal coverage indicates the time range of the published data.") }} <br>
            {{ $t("For example : from 2012 to 2015.") }}
          </p>
          <SimpleBanner
            v-if="getFirstWarning('temporal_coverage')"
            class="font-bold mt-2"
            type="warning"
          >
            {{ getFirstWarning("temporal_coverage") }}
          </SimpleBanner>
        </Accordion>
        <Accordion
          :id="addSpatialInformationAccordionId"
          :title="$t('Complete the spatial information')"
          :state="accordionState('spatial_granularity')"
        >
          <!-- TODO add spatial zones too -->
          <p class="fr-m-0">
            {{ $t("The spatial granularity indicates the finest geographical level of detail that your data can cover.") }} <br>
            {{ $t("For example: at the department or municipality scale.") }}
          </p>
          <SimpleBanner
            v-if="getFirstWarning('spatial_granularity')"
            class="font-bold mt-2"
            type="warning"
          >
            {{ getFirstWarning("spatial_granularity") }}
          </SimpleBanner>
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
              {{ $t('What is a dataset?') }}
            </p>
            <p class="m-0 text-xs/5">
              {{ $t('On {site}, a dataset is a set of files.', { site: config.public.title }) }}
            </p>
          </div>
        </SimpleBanner>

        <RequiredExplanation />
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
              {{ $t("Producer") }}
            </h2>
          </legend>
          <div class="fr-fieldset__element">
            <ProducerSelect
              v-model="form.owned"
              :label="t('Check the identity with which you want to publish')"
              :required="true"
              :error-text="getFirstError('owned')"
              :warning-text="getFirstWarning('owned')"
              :all=""
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
              :aria-describedby="nameDatasetAccordionId"
              :label="$t('Dataset name')"
              :required="true"
              :has-error="!!getFirstError('title')"
              :has-warning="!!getFirstWarning('title')"
              :error-text="getFirstError('title')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addAcronymAccordionId"
            @blur="touch('acronym')"
          >
            <InputGroup
              v-model="form.acronym"
              :label="$t('Acronym')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element min-width-0"
            :accordion="writeAGoodDescriptionAccordionId"
          >
            <InputGroup
              v-model="form.description"
              :label="$t('Description')"
              :required="true"
              type="markdown"
              :has-error="!!getFirstError('description')"
              :has-warning="!!getFirstWarning('description')"
              :error-text="getFirstError('description')"
              @change="touch('description')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="useTagsAccordionId"
            @blur="touch('tags')"
          >
            <TagsSelect
              v-model="form.tags"
              :error-text="getFirstError('tags')"
              :warning-text="getFirstWarning('tags')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="selectLicenseAccordionId"
            @blur="touch('license')"
          >
            <SearchableSelect
              v-model="form.license"
              :options="licenses"
              :label="t('License')"
              :placeholder="t('Select a license')"
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
                      <span>{{ t('Recommended') }}</span>
                    </div>
                    <div v-if="option.description">
                      {{ option.description }}
                    </div>
                  </div>
                </div>
              </template>
            </SearchableSelect>
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
              {{ harvested ? t("Attributions and Contact points") : t("Contact points") }}
            </h2>
          </legend>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="contactPointAccordionId"
            @blur="touch('contact_points')"
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
              class="mt-3"
              type="button"
              color="primary-soft"
              size="xs"
              :icon="RiAddLine"
              @click="form.contact_points.push({ ...defaultContactForm })"
            >
              {{ harvested ? t('New Attribution') : t('New Contact') }}
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
              {{ $t("Time") }}
            </h2>
          </legend>
          <LinkedToAccordion
            :accordion="chooseFrequencyAccordionId"
            class="fr-fieldset__element"
            @blur="touch('frequency')"
          >
            <SearchableSelect
              v-model="form.frequency"
              :label="$t('Update frequency')"
              :placeholder="$t('Search a frequency…')"
              :get-option-id="(frequency) => frequency.label"
              :display-value="(frequency) => frequency.label"
              :options="frequencies"
              :multiple="false"
              :required="true"
              :error-text="getFirstError('frequency')"
              :warning-text="getFirstWarning('frequency')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            :accordion="addTemporalCoverageAccordionId"
            class="fr-fieldset__element"
            @blur="touch('temporal_coverage')"
          >
            <p class="!mb-2">
              {{ $t('Temporal coverage') }}
            </p>
            <div class="grid lg:grid-cols-2 gap-4">
              <InputGroup
                v-model="form.temporal_coverage.start"
                :label="$t('start')"
                type="date"
                :show-label-inside="true"
                :has-error="!!getFirstError('temporal_coverage')"
                :has-warning="!!getFirstWarning('temporal_coverage')"
                :error-text="getFirstError('temporal_coverage')"
              />
              <InputGroup
                v-model="form.temporal_coverage.end"
                :label="$t('end')"
                type="date"
                :show-label-inside="true"
              />
            </div>
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
              {{ $t("Space") }}
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
                    :label="$t('Spatial coverage')"
                    :placeholder="$t('Search a spatial coverage…')"
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
                  :label="$t('Spatial granularity')"
                  :placeholder="$t('Search a granularity…')"
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
              </div>
            </div>
          </LinkedToAccordion>
          <fieldset
            v-if="type === 'update'"
            class="fr-fieldset__element"
          >
            <fieldset
              id="checkboxes-hint-el-sm"
              class="fr-fieldset"
              aria-labelledby="checkboxes-hint-el-sm-legend checkboxes-hint-el-sm-messages"
            >
              <div class="fr-fieldset__element">
                <div class="fr-checkbox-group fr-checkbox-group--sm">
                  <input
                    id="checkboxes-hint-el-sm-1"
                    v-model="datasetForm.private"
                    name="checkboxes-hint-el-sm-1"
                    type="checkbox"
                    aria-describedby="checkboxes-hint-el-sm-1-messages"
                  >
                  <label
                    class="fr-label"
                    for="checkboxes-hint-el-sm-1"
                  >
                    {{ t('Switch to draft mode') }}
                    <span class="fr-hint-text">{{ t('The dataset will only be visible to members of your organization.') }}</span>
                  </label>
                  <div
                    id="checkboxes-hint-el-sm-1-messages"
                    class="fr-messages-group"
                    aria-live="assertive"
                  />
                </div>
              </div>
            </fieldset>
          </fieldset>
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
            {{ $t('Previous') }}
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
import ProducerSelect from '~/components/ProducerSelect.vue'
import SearchableSelect from '~/components/SearchableSelect.vue'
import type { DatasetForm, EnrichedLicense, SpatialGranularity, SpatialZone } from '~/types/types'

const datasetForm = defineModel<DatasetForm>({ required: true })

const props = defineProps<{
  submitLabel: string
  type: 'create' | 'update'
  harvested?: boolean
}>()
const emit = defineEmits<{
  previous: []
  submit: []
}>()

const { t } = useI18n()
const config = useRuntimeConfig()

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
  frequency: [required()],
  private: [],
}, {
  description: [minLength(200, t(`It's advised to have a {property} of at least {min} characters.`, { property: t('description'), min: 200 }))],
  tags: [required(t('Adding tags helps improve the SEO of your data.'))],
  license: [required()],
  frequency: [(f) => {
    if (f && f.id === 'unknown') return t('The frequency must be different than unknown.')

    return null
  }],
  spatial_granularity: [required(t('You have not specified the spatial granularity.'))],
  temporal_coverage: [required(t('You did not provide the temporal coverage.'))],
})

onMounted(() => {
  if (props.type === 'update') validate()
})

const accordionState = (key: keyof typeof form.value) => {
  if (getFirstError(key)) return 'error'
  if (getFirstWarning(key)) return 'warning'

  return 'default'
}

function submit() {
  if (validate()) {
    emit('submit')
  }
};
</script>
