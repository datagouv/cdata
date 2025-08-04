<template>
  <LoadingBlock
    v-if="organization.metrics.reuses"
    :status
  >
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card
        v-for="reuse in reuses.data"
        :key="reuse.id"
        :reuse
      />
    </div>
    <Pagination
      :total-results="reuses.total"
      :page="reuses.page"
      :page-size="reuses.page_size"
      :link="getLink"
    />
  </LoadingBlock>
  <div
    v-else
    class="flex flex-col items-center lg:pt-12"
  >
    <NuxtImg
      src="/illustrations/reuse.svg"
      width="137"
      height="104"
    />
    <p class="mt-4 mb-5 font-bold text-lg">
      {{ $t(`Cette organisation n'a pas encore publié de réutilisations.`) }}
    </p>
    <BrandedButton
      color="secondary"
      :href="config.public.reuseGuideUrl"
    >
      {{ $t(`Qu'est-ce qu'une réutilisation ?`) }}
    </BrandedButton>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, Pagination } from '@datagouv/components-next'
import type { Organization, Reuse } from '@datagouv/components-next'
import Card from '~/components/Reuses/ReuseCard.vue'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{
  organization: Organization
}>()

const config = useRuntimeConfig()

const { data: reuses, status } = await useAPI<PaginatedArray<Reuse>>('/api/2/reuses/search/', {
  params: { organization: props.organization.id, page_size: 15 },
})
</script>
