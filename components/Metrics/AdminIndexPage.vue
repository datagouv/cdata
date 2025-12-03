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
              :data="metrics?.datasetsViews"
              type="line"
              :summary="metrics?.datasetsViewsTotal"
            />
            <StatBox
              :title="$t('Téléchargements des données')"
              :data="metrics?.downloads"
              type="line"
              :summary="metrics?.downloadsTotal"
            />
            <StatBox
              :title="$t('Visites des API')"
              :data="metrics?.dataservicesViews"
              type="line"
              :summary="metrics?.dataservicesViewsTotal"
            />
            <StatBox
              :title="$t('Visites des réutilisations')"
              :data="metrics?.reusesViews"
              type="line"
              :summary="metrics?.reusesViewsTotal"
            />
          </ClientOnly>
        </section>
      </template>
    </PaddedContainer>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, PaddedContainer, StatBox, useMetrics, createOrganizationMetricsUrl, type Organization, type User, type OrganizationMetrics } from '@datagouv/components-next'
import { RiDownloadLine } from '@remixicon/vue'

const props = defineProps<{
  organization?: Organization | null
  user?: User | null
}>()

const { getOrganizationMetrics } = useMetrics()
const metrics = ref<OrganizationMetrics | null>(null)

watchEffect(async () => {
  if (!props.organization) return
  metrics.value = await getOrganizationMetrics(props.organization.id)
})

const downloadStatsUrl = computed(() => {
  if (!metrics.value) return null

  return createOrganizationMetricsUrl(metrics.value.datasetsViews, metrics.value.downloads, metrics.value.dataservicesViews, metrics.value.reusesViews)
})
</script>
