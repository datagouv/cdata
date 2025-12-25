<template>
  <div>
    <EditoHeader
      color="purple"
      subtitle=""
      :title="$t('Rechercher sur DataGouv')"
      :placeholder="$t('ex. élections présidentielles')"
      search-url="/reuses/search"
      :default-query="searchQuery"
    />
    <SearchGlobal :config="searchConfig" />
  </div>
</template>

<script setup lang="ts">
import { SearchGlobal } from '@datagouv/components-next'
import EditoHeader from '~/components/Pages/EditoHeader.vue'

const { t } = useTranslation()
useSeoMeta({
  title: t('Recherche des jeux de données — data.gouv.fr'),
})

const route = useRoute()
const searchQuery = computed(() => (route.query.q as string) || '')

const searchConfig = [
  {
    className: 'API',
    class: 'dataservices' as const,
    display: true,
    basicFilters: ['access_type', 'last_update_range', 'producer_type', 'data_label'],
    advancedFilters: ['organization', 'tags'],
  },
  {
    className: 'Jeux de données',
    class: 'datasets' as const,
    display: true,
    basicFilters: ['format_family', 'access_type', 'last_update_range', 'producer_type', 'data_label'],
    advancedFilters: ['organization', 'tags', 'format', 'license', 'schema', 'geozone', 'granularity'],
  },
  {
    className: 'Réutilisations',
    class: 'reuses' as const,
    display: true,
    basicFilters: ['type', 'topic'],
    advancedFilters: ['organization', 'tags'],
  },
  {
    className: 'Organisations',
    class: 'organizations' as const,
    display: true,
    basicFilters: ['producer_type'],
    advancedFilters: [],
  },
  {
    className: 'Discussions',
    class: 'discussions' as const,
    display: true,
    basicFilters: ['object_type', 'last_update_range'],
    advancedFilters: [],
  },
  {
    className: 'Articles',
    class: 'posts' as const,
    display: true,
    basicFilters: ['last_update_range'],
    advancedFilters: [],
  },
  {
    className: 'Thématiques',
    class: 'topics' as const,
    display: true,
    basicFilters: ['last_update_range', 'producer_type'],
    advancedFilters: ['organization', 'tags'],
  },
]
</script>
