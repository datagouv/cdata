<template>
  <div>
    <div
      v-if="downloadStatsUrl"
      class="flex justify-end -mt-14 pt-0.5 mb-5"
    >
      <BrandedButton
        color="secondary"
        :disabled="!downloadStatsUrl"
        :href="downloadStatsUrl || ''"
        :title="$t('Télécharger le fichier')"
        download="stats.csv"
        :icon="RiDownloadLine"
        size="xs"
      >
        {{ $t('Télécharger les statistiques agrégées') }}
      </BrandedButton>
    </div>
    <PaddedContainer class="mb-5">
      <section
        class="grid md:grid-cols-2 xl:grid-cols-4 gap-4 px-4 pb-4"
      >
        <ClientOnly v-if="organization">
          <StatBox
            :title="$t('Jeux de données')"
            :data="organization.metrics.datasets_by_months"
            type="bar"
            :summary="organization.metrics.datasets"
          />
          <StatBox
            :title="$t('API')"
            :data="organization.metrics.dataservices_by_months"
            type="bar"
            :summary="organization.metrics.dataservices"
          />
          <StatBox
            :title="$t('Réutilisations')"
            :data="organization.metrics.reuses_by_months"
            type="bar"
            :summary="organization.metrics.reuses"
          />
        </ClientOnly>
        <ClientOnly v-else-if="user">
          <StatBox
            :title="$t('Jeux de données')"
            type="bar"
            :summary="user.metrics.datasets"
          />
          <StatBox
            :title="$t('API')"
            type="bar"
            :summary="user.metrics.dataservices"
          />
          <StatBox
            :title="$t('Réutilisations')"
            type="bar"
            :summary="user.metrics.reuses"
          />
        </ClientOnly>
      </section>
      <template v-if="organization">
        <Divider
          color="bg-gray-default"
          class="mb-6 pr-24"
        />
        <section
          class="grid md:grid-cols-2 xl:grid-cols-4 gap-4 px-4 pb-4"
        >
          <ClientOnly>
            <StatBox
              :title="$t('Visites des jeux de données')"
              :data="metricsDatasetsViews"
              type="line"
              :summary="metricsDatasetsViewsTotal"
            />
            <StatBox
              :title="$t('Téléchargements des données')"
              :data="metricsDownloads"
              type="line"
              :summary="metricsDownloadsTotal"
            />
            <StatBox
              :title="$t('Visites des API')"
              :data="metricsDataservicesViews"
              type="line"
              :summary="metricsDataservicesViewsTotal"
            />
            <StatBox
              :title="$t('Visites des réutilisations')"
              :data="metricsReuses"
              type="line"
              :summary="metricsReusesTotal"
            />
          </ClientOnly>
        </section>
      </template>
    </PaddedContainer>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, PaddedContainer, StatBox, type Organization, type User } from '@datagouv/components-next'
import { RiDownloadLine } from '@remixicon/vue'

const props = defineProps<{
  organization?: Organization | null
  user?: User | null
}>()

const metricsDataservicesViews = ref<null | Record<string, number>>(null)
const metricsDataservicesViewsTotal = ref<null | number>(null)
const metricsDatasetsViews = ref<null | Record<string, number>>(null)
const metricsDatasetsViewsTotal = ref<null | number>(null)
const metricsDownloads = ref<null | Record<string, number>>(null)
const metricsDownloadsTotal = ref<null | number>(null)
const metricsReuses = ref<null | Record<string, number>>(null)
const metricsReusesTotal = ref<null | number>(null)

watchEffect(async () => {
  if (!props.organization) return
  const metrics = await getOrganizationMetrics(props.organization.id)
  metricsDownloads.value = metrics.downloads
  metricsDownloadsTotal.value = metrics.downloadsTotal
  metricsReuses.value = metrics.reusesViews
  metricsReusesTotal.value = metrics.reusesViewsTotal
  metricsDataservicesViews.value = metrics.dataservicesViews
  metricsDataservicesViewsTotal.value = metrics.dataservicesViewsTotal
  metricsDatasetsViews.value = metrics.datasetsViews
  metricsDatasetsViewsTotal.value = metrics.datasetsViewsTotal
})

const downloadStatsUrl = computed(() => {
  if (!metricsDatasetsViews.value || !metricsDownloads.value || !metricsDataservicesViews.value || !metricsReuses.value) {
    return null
  }

  return createOrganizationMetricsUrl(metricsDatasetsViews.value, metricsDownloads.value, metricsDataservicesViews.value, metricsReuses.value)
})
</script>
