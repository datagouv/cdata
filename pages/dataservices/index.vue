<template>
  <div>
    <EditoHeader
      color="purple"
      :title="$t('APIs')"
      :subtitle="$t('Rechercher parmi les {count} APIs sur {site}', {
        count: site.metrics.dataservices,
        site: config.public.title,
      })"
      :placeholder="$t('ex: SIRENE')"
      search-url="/dataservices/search"
      :link-label="$t(`Qu'est-ce qu'une API ?`)"
      :link-url="config.public.guideDataservices"
    />
    <PageShow
      v-if="page"
      :page
    />
    <EditoFooter
      color="purple"
      search-url="/dataservices/search"
      :search-label="$t(`Voir toutes les APIs`)"
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
  title: t('APIs'),
})

const config = useRuntimeConfig()

const { data: site } = await useAPI<Site>('/api/1/site')
const { data: page } = await useAPI<Page>(`/api/1/pages/${site.value.dataservices_page_id}`)
</script>
