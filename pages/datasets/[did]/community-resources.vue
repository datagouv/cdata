<template>
  <div
    v-if="resources && resources.total > 0"
    class="space-y-5"
  >
    <SimpleBanner type="warning">
      {{ $t('Ces ressources sont publiées par la communauté et ne sont pas sous la responsabilité du producteur des données.') }}
    </SimpleBanner>
    <div class="space-y-1">
      <div class="uppercase text-gray-plain text-sm font-bold">
        {{ $t('{n} community resources', { n: resources.total }) }}
      </div>
      <div class="space-y-2.5">
        <ResourceAccordion
          v-for="resource in resources.data"
          :key="resource.id"
          :dataset
          :resource
          :can-edit="resource.permissions.edit"
        />
        <Pagination
          :total-results="resources.total"
          :page-size="resources.page_size"
          :page="resources.page"
          @change="(newPage) => page = newPage"
        />
      </div>
    </div>
  </div>
  <div
    v-else-if="resources"
    class="flex flex-col items-center"
  >
    <nuxt-img
      src="/illustrations/schema.svg"
      class="h-20"
    />
    <p class="fr-text--bold fr-my-3v">
      {{ $t(`Il n'y a pas encore de ressources communautaires pour ce jeu de données.`) }}
    </p>
    <div class="flex items-center space-x-4">
      <BrandedButton
        color="primary"
        :href="`/admin/community-resources/new?dataset_id=${dataset.id}`"
      >
        {{ $t('Partagez vos ressources') }}
      </BrandedButton>
      <BrandedButton
        color="secondary"
        :href="config.public.guidesCommunityResources"
      >
        {{ $t('En savoir plus sur la communauté') }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, Pagination, ResourceAccordion, SimpleBanner, type CommunityResource, type DatasetV2 } from '@datagouv/components-next'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{ dataset: DatasetV2 }>()

useSeoMeta({ robots: 'noindex' })

const config = useRuntimeConfig()

const page = ref(1)
const query = computed(() => ({
  page: page.value,
  dataset: props.dataset.id,
  page_size: 5,
}))
const { data: resources } = await useAPI<PaginatedArray<CommunityResource>>('/api/1/datasets/community_resources', { query })
</script>
