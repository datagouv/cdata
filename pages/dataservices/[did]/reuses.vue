<template>
  <div class="space-y-5">
    <div
      v-if="reuses && reuses.total"
      class="space-y-1"
    >
      <div class="uppercase text-gray-plain text-sm font-bold">
        {{ $t('{n} réutilisations | {n} réutilisation | {n} réutilisations', { n: reuses.total }) }}
      </div>
      <div class="space-y-2.5">
        <div class="grid sm:grid-cols-3 gap-2.5">
          <ReuseCard
            v-for="reuse in reuses.data"
            :key="reuse.id"
            class="truncate"
            :reuse-url="reuse.page"
            :reuse
          />
        </div>
        <Pagination
          :total-results="reuses.total"
          :page-size="reuses.page_size"
          :page="reuses.page"
          @change="(newPage) => reusesPage = newPage"
        />
      </div>
    </div>
    <div
      v-if="reuses && !reuses.total"
      class="flex flex-col items-center"
    >
      <img
        src="/illustrations/reuse.svg"
        class="h-20"
        alt=""
      >
      <p class="font-bold my-3">
        {{ $t(`Il n'y a pas encore de réutilisations associées`) }}
      </p>
      <BrandedButton
        color="primary"
        href="/admin/reuses/new"
      >
        {{ $t('Ajouter une réutilisation') }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, Pagination, type Dataservice, type Reuse } from '@datagouv/components-next'
import type { PaginatedArray } from '~/types/types'
import ReuseCard from '~/components/Reuses/ReuseCard.vue'

const props = defineProps<{ dataservice: Dataservice }>()

useSeoMeta({ robots: 'noindex' })

const reusesPage = ref(1)
const reusesQuery = computed(() => ({
  dataservice: props.dataservice.id,
  page: reusesPage.value,
  page_size: 6,
}))

const { data: reuses } = await useAPI<PaginatedArray<Reuse>>('/api/1/reuses', {
  query: reusesQuery,
  headers: {
    'X-Fields': reusesXFields,
  },
})
</script>
