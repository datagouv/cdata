<template>
  <div>
    <EditoHeader
      color="green"
      :title="$t('Réutilisations')"
      :subtitle="$t('Rechercher parmi les {count} réutilisations sur {site}', {
        count: site.metrics.reuses,
        site: config.public.title,
      })"
      :placeholder="$t('Rechercher une réutilisation de données')"
      search-url="/reuses/search"
      :link-label="$t(`Qu'est-ce qu'une réutilisation ?`)"
      :link-url="config.public.guideReuses"
    />
    <PageShow
      v-if="page"
      :page
    />
    <EditoFooter
      color="green"
      search-url="/reuses/search"
      :search-label="$t(`Voir toutes les réutilisations`)"
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
  title: t('Réutilisations'),
})

const config = useRuntimeConfig()

const { data: site } = await useAPI<Site>('/api/1/site')
const { data: page } = await useAPI<Page>(`/api/1/pages/${site.value.reuses_page_id}`)
</script>
