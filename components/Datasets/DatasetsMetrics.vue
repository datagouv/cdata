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
              {{ t('Statistics for the last 12 months') }}
            </div>
            <div class="text-gray-medium font-normal text-sm/6">
              <span v-if="new Date().getHours() > 7 - 1">{{ $t('Updated this morning') }}</span>
              <span v-else>{{ $t('Updated yesterday') }}</span>
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
            :title="t('Download file')"
            download="stats.csv"
            :icon="RiDownloadLine"
            size="xs"
            class="relative z-2"
          >
            {{ t('Download') }}
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
        :title="t('Views')"
        :data="metricsViews"
        type="line"
        :summary="metricsViewsTotal"
        class="md:w-1/3 mb-8 md:mb-0"
      />
      <StatBox
        :title="t('Téléchargements')"
        :data="metricsDownloads"
        type="line"
        :summary="metricsDownloadsTotal"
        class="md:w-1/3 mb-8 md:mb-0"
      />
      <StatBox
        :title="t('Reuses Visits')"
        :data="metricsReuses"
        type="line"
        :summary="metricsReusesTotal"
        class="md:w-1/3 mb-8 md:mb-0"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { StatBox, type Organization } from '@datagouv/components-next'
import { RiDownloadLine } from '@remixicon/vue'

const props = defineProps<{
  organization: Organization
}>()

const { t } = useI18n()

const metricsOpen = ref(false)
const metricsTitleId = useId()

const metricsViews = ref<null | Record<string, number>>(null)
const metricsViewsTotal = ref<null | number>(null)
const metricsDownloads = ref<null | Record<string, number>>(null)
const metricsDownloadsTotal = ref<null | number>(null)
const metricsReuses = ref<null | Record<string, number>>(null)
const metricsReusesTotal = ref<null | number>(null)
watchEffect(async () => {
  if (!props.organization.id) return
  const metrics = await getOrganizationMetrics(props.organization.id)
  metricsDownloads.value = metrics.downloads
  metricsDownloadsTotal.value = metrics.downloadsTotal
  metricsReuses.value = metrics.reusesViews
  metricsReusesTotal.value = metrics.reusesViewsTotal
  metricsViews.value = metrics.datasetsViews
  metricsViewsTotal.value = metrics.datasetsViewsTotal
})

const downloadStatsUrl = computed(() => {
  if (!metricsViews.value || !metricsDownloads.value || !metricsReuses.value) {
    return null
  }

  return createOrganizationMetricsUrl(metricsViews.value, metricsDownloads.value, metricsReuses.value)
})
</script>
