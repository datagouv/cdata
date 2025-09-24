<template>
  <div class="py-6 mb-6 border-bottom border-gray-default">
    <h2 class="subtitle subtitle--uppercase">
      {{ $t('Informations') }}
    </h2>
    <div class="fr-text--sm fr-m-0">
      <dl class="fr-grid-row fr-grid-row--gutters">
        <div
          v-if="license"
          class="fr-col-12 fr-col-sm-6 fr-col-md-4"
        >
          <dt class="subtitle fr-mb-0">
            {{ $t('Licence') }}
          </dt>
          <dd class="text-sm m-0 text-gray-medium p-0">
            <code class="bg-grey-some px-1 text-gray-medium">
              <a :href="license.url">
                {{ license.title }}
              </a>
            </code>
          </dd>
        </div>
        <div class="fr-col-12 fr-col-sm-6 fr-col-md-4">
          <dt class="subtitle fr-mb-0">
            {{ $t('Identifiant') }}
          </dt>
          <dd class="text-sm m-0 text-gray-medium p-0">
            {{ dataset.id }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
  <div class="pb-6 mb-6 border-bottom border-gray-default">
    <h2 class="subtitle subtitle--uppercase">
      {{ $t('Temporalité') }}
    </h2>
    <div class="fr-text--sm fr-m-0">
      <dl class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-12 fr-col-sm-6 fr-col-md-4">
          <dt class="subtitle fr-mb-0">
            {{ $t('Création') }}
          </dt>
          <dd class="text-sm m-0 text-gray-medium p-0">
            {{ formatDate(dataset.created_at) }}
          </dd>
        </div>
        <div
          v-if="frequency"
          class="fr-col-12 fr-col-sm-6 fr-col-md-4"
        >
          <dt class="subtitle fr-mb-0">
            {{ $t('Fréquence') }}
          </dt>
          <dd class="text-sm m-0 text-gray-medium p-0">
            {{ frequency.label }}
          </dd>
        </div>
      </dl>
      <dl class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-12 fr-col-sm-6 fr-col-md-4">
          <dt class="subtitle fr-mb-0">
            {{ $t('Dernière mise à jour') }}
          </dt>
          <dd class="text-sm m-0 text-gray-medium p-0">
            {{ formatDate(props.dataset.last_update) }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
  <div class="pb-6 mb-6 border-bottom border-gray-default">
    <h2 class="subtitle subtitle--uppercase">
      {{ $t('Couverture spatiale') }}
    </h2>
    <div class="fr-text--sm fr-m-0">
      <dl class="fr-grid-row fr-grid-row--gutters">
        <div
          v-if="zonesLabels.length"
          class="fr-col-12 fr-col-sm-6 fr-col-md-4"
        >
          <dt class="subtitle fr-mb-0">
            {{ $t('Couverture territoriale') }}
          </dt>
          <dd class="text-sm m-0 text-gray-medium p-0">
            {{ zonesLabels.join(', ') }}
          </dd>
        </div>
        <div
          v-if="granularity"
          class="fr-col-12 fr-col-sm-6 fr-col-md-4"
        >
          <dt class="subtitle fr-mb-0">
            {{ $t('Granularité de la couverture territoriale') }}
          </dt>
          <dd class="text-sm m-0 text-gray-medium p-0">
            {{ granularity.name }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
  <div class="pb-6 mb-6 border-bottom border-gray-default">
    <h2 class="subtitle subtitle--uppercase">
      {{ $t('Actions') }}
    </h2>
    <div class="fr-text--sm fr-m-0">
      <h3 class="subtitle fr-mb-1v">
        {{ $t('Intégrer sur votre site') }}
        <CopyButton
          :hide-label="true"
          :label="$t(`Copier l'intégration`)"
          :copied-label="$t('Intégration copiée !')"
          class="fr-my-1w fr-mr-1w"
          :text="getDatasetOEmbedHtml('dataset', dataset.id)"
        />
      </h3>
      <div class="embed-wrapper">
        <textarea
          ref="textAreaRef"
          :value="getDatasetOEmbedHtml('dataset', dataset.id)"
          readonly="true"
          rows="1"
          @click="selectContent"
        />
      </div>
    </div>
  </div>
  <div v-if="hasExtras">
    <ExtraAccordion
      :button-text="t('Voir les extras')"
      :title-text="t('Extras')"
      :extra="props.dataset.extras"
      title-level="h2"
    />
  </div>
  <div v-if="props.dataset?.harvest">
    <ExtraAccordion
      :button-text="t('Voir le moissonage')"
      :title-text="t('Moissonnage')"
      :extra="props.dataset.harvest"
      title-level="h2"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFormatDate } from '../functions/dates'
// import useOEmbed from '../../composables/useOEmbed'
import type { Dataset, DatasetV2 } from '../types/datasets'
import type { Granularity } from '../types/granularity'
import type { Frequency } from '../types/frequency'
import type { License } from '../types/licenses'
import { useFetch } from '../functions/api'
import { getDatasetOEmbedHtml } from '../functions/datasets'
import ExtraAccordion from './ExtraAccordion.vue'
import CopyButton from './CopyButton.vue'

const props = defineProps<{
  dataset: DatasetV2 | Dataset
}>()
const { t } = await useTranslation()
const { formatDate } = useFormatDate()
// const embedText = useOEmbed('dataset', props.dataset.id)
const textAreaRef = ref<HTMLTextAreaElement | null>(null)

const hasExtras = computed(() => Object.keys(props.dataset.extras).length > 0)

function selectContent() {
  if (textAreaRef.value) {
    textAreaRef.value.select()
  }
};

const { data: allLicenses } = await useFetch<Array<License>>('/api/1/datasets/licenses/')
const license = computed(() => {
  if (!props.dataset.license) return null
  if (!allLicenses.value) return null

  return allLicenses.value.find(license => license.id === props.dataset.license)
})

const { data: frequencies } = await useFetch<Array<Frequency>>('/api/1/datasets/frequencies/')
const frequency = computed(() => {
  if (!props.dataset.frequency) return null
  if (!frequencies.value) return null

  return frequencies.value.find(frequency => frequency.id === props.dataset.frequency)
})

const zonesUrl = computed(() => {
  if (!props.dataset.spatial?.zones || !props.dataset.spatial.zones.length) return null

  return `/api/1/spatial/zones/${props.dataset.spatial.zones.join(',')}/`
})
const { data: zones } = await useFetch<{ features: Array<{ properties: { name: string } }> }>(zonesUrl)
const zonesLabels = computed(() => {
  if (!zones.value) return []
  return zones.value.features.map(feature => feature.properties.name)
})

const { data: granularities } = await useFetch<Array<Granularity>>('/api/1/spatial/granularities/')
const granularity = computed(() => {
  if (!props.dataset.spatial?.granularity) return null
  if (!granularities.value) return null

  return granularities.value.find(granularity => granularity.id === props.dataset.spatial?.granularity)
})
</script>
