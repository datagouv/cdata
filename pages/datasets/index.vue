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
import EditoFooter from '~/components/Pages/EditoFooter.vue'
import EditoHeader from '~/components/Pages/EditoHeader.vue'
import EditoBlocs from '~/components/Pages/EditoBlocs.vue'

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

const { site, blocs: siteBlocs, saveBlocs } = await useSiteBlocs('datasets_blocs', ['metrics'])

const isEditing = computed(() => route.query.edit === 'true')
</script>
