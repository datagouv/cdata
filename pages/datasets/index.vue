<template>
  <div>
    <EditoHeader
      color="primary"
      :title="$t('Jeux de données')"
      :subtitle="$t('Rechercher parmi les {count} jeux de données sur {site}', {
        count: site.metrics.datasets,
        site: config.public.title,
      })"
      :placeholder="$t('ex. élections présidentielles')"
      search-url="/datasets/search"
      :link-label="$t(`Qu'est-ce qu'un jeu de données ?`)"
      :link-url="config.public.guideDatasets"
    />
    <PageShow
      v-if="page"
      :page
    />
    <EditoFooter
      color="primary"
      search-url="/datasets/search"
      :search-label="$t(`Voir tous les jeux de données`)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Site } from '@datagouv/components-next'
import EditoFooter from '~/components/Pages/EditoFooter.vue'
import EditoHeader from '~/components/Pages/EditoHeader.vue'
import PageShow from '~/components/Pages/PageShow.vue'
import type { Page } from '~/types/pages'

const { t } = useI18n()
useSeoMeta({
  title: t('Jeux de données - data.gouv.fr'),
})

const config = useRuntimeConfig()
const route = useRoute()

onMounted(async () => {
  const hasFacets = Object.keys(route.query).some(key =>
    ['q', 'tag', 'format', 'license', 'organization', 'organization_badge',
      'geozone', 'granularity', 'schema', 'sort', 'page'].includes(key),
  )

  if (hasFacets) {
    await navigateTo({ path: '/datasets/search', query: route.query })
  }
})

const { data: site } = await useAPI<Site>('/api/1/site')
const { data: page } = await useAPI<Page>(`/api/1/pages/${site.value.datasets_page}`)
</script>
