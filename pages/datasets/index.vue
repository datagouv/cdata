<template>
  <div>
    <EditoHeader
      color="primary"
      :title="$t('Rechercher un jeu de données')"
      :subtitle="$t('parmi les {count} jeux de données sur {site}', {
        count: site?.metrics.datasets ?? 0,
        site: config.public.title,
      })"
      :placeholder="$t('ex. élections présidentielles')"
      search-url="/datasets/search"
      :link-label="$t(`Qu'est-ce qu'un jeu de données ?`)"
      :link-url="config.public.guideDatasets"
    />
    <EditoBlocs
      v-if="siteBlocs.length > 0 || isEditing"
      :blocs="siteBlocs"
      editable
      :on-save="saveBlocs"
    />
    <EditoFooter
      color="primary"
      search-url="/datasets/search"
      :search-label="$t(`Voir tous les jeux de données`)"
    />
  </div>
</template>

<script setup lang="ts">
import { toast, type Site } from '@datagouv/components-next'
import EditoFooter from '~/components/Pages/EditoFooter.vue'
import EditoHeader from '~/components/Pages/EditoHeader.vue'
import EditoBlocs from '~/components/Pages/EditoBlocs.vue'
import type { PageBloc } from '~/types/pages'

defineOgImage('MainPage.takumi', {
  title: 'Jeux de données',
  uri: '/datasets',
})

const config = useRuntimeConfig()
const { t } = useTranslation()

const title = t('Catalogue des jeux de données publics - {site}', { site: config.public.title })
const description = t('Vous recherchez des données publiques sur un sujet précis ? Explorez le catalogue de {site} alimenté par l\'administration et la société civile.', { site: config.public.title })

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
})
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

const { $api } = useNuxtApp()

const { data: site, refresh: refreshSite } = await useAPI<Site>('/api/1/site/', {
  key: 'site-datasets-blocs',
  headers: { 'X-Fields': '{metrics,datasets_blocs}' },
})

const siteBlocs = computed(() => site.value?.datasets_blocs ?? [])

const isEditing = computed(() => route.query.edit === 'true')

async function saveBlocs(blocs: Array<PageBloc>) {
  try {
    await $api('/api/1/site/', {
      method: 'PATCH',
      body: { datasets_blocs: blocs },
    })
    await refreshSite()
    toast.success(t('Page sauvegardée'))
  }
  catch {
    toast.error(t('Erreur lors de la sauvegarde'))
  }
}
</script>
