<template>
  <div
    class="bg-white border rounded"
    :class="{ 'pb-4': metricsOpen }"
  >
    <header class="p-4 flex items-center justify-between relative">
      <div>
        <h4
          :id="metricsTitleId"
          class="!mb-0 flex items-center"
        >
          <button
            type="button"
            class="fr-p-0 text-left"
            data-testid="expand-button"
            :aria-expanded="metricsOpen"
            @click="metricsOpen = ! metricsOpen"
          >
            <div class="text-gray-title font-bold text-base/6">
              {{ t('Statistiques des 12 derniers mois') }}
            </div>
            <div class="text-gray-medium font-normal text-sm/6">
              <span v-if="new Date().getHours() > 7 - 1">{{ $t('Mises à jour ce matin') }}</span>
              <span v-else>{{ $t('Mises à jour hier') }}</span>
            </div>

            <span class="absolute inset-0 z-1" />
          </button>
        </h4>
      </div>
      <div class="flex items-center">
        <p class="fr-col-auto fr-ml-3v fr-m-0">
          <BrandedButton
            :disabled="!downloadStatsUrl"
            :href="downloadStatsUrl || ''"
            rel="ugc nofollow noopener"
            :title="t('Télécharger le fichier')"
            download="stats.csv"
            :icon="RiDownloadLine"
            size="xs"
            class="relative z-2"
          >
            {{ t('Télécharger') }}
          </BrandedButton>
        </p>
        <div
          class="fr-icon--sm fr-ml-4v"
          :class="{ 'fr-icon-arrow-up-s-line': metricsOpen, 'fr-icon-arrow-down-s-line': !metricsOpen }"
        />
      </div>
    </header>
    <section
      v-if="metricsOpen"
      :aria-labelledby="metricsTitleId"
      class="flex flex-col md:flex-row px-4 pb-4"
    >
      <StatBox
        :title="t('Vues')"
        :data="metrics?.datasetsViews"
        type="line"
        :summary="metrics?.datasetsViewsTotal"
        class="md:w-1/3 mb-8 md:mb-0"
      />
      <StatBox
        :title="t('Téléchargements')"
        :data="metrics?.downloads"
        type="line"
        :summary="metrics?.downloadsTotal"
        class="md:w-1/3 mb-8 md:mb-0"
      />
      <StatBox
        :title="t('Nombre de visites des réutilisations')"
        :data="metrics?.reusesViews"
        type="line"
        :summary="metrics?.reusesViewsTotal"
        class="md:w-1/3 mb-8 md:mb-0"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, StatBox, useMetrics, createOrganizationMetricsUrl, type Organization, type OrganizationMetrics } from '@datagouv/components-next'
import { RiDownloadLine } from '@remixicon/vue'

const props = defineProps<{
  organization: Organization
}>()

const { t } = useTranslation()
const { getOrganizationMetrics } = useMetrics()

const metricsOpen = ref(false)
const metricsTitleId = useId()

const metrics = ref<OrganizationMetrics | null>(null)

watchEffect(async () => {
  if (!props.organization.id) return
  metrics.value = await getOrganizationMetrics(props.organization.id)
})

const downloadStatsUrl = computed(() => {
  if (!metrics.value) return null

  return createOrganizationMetricsUrl(metrics.value.datasetsViews, metrics.value.downloads, metrics.value.dataservicesViews, metrics.value.reusesViews)
})
</script>
