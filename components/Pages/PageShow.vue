<template>
  <div
    v-for="(bloc, index) in page.blocs"
    :key="index"
    class="py-24"
  >
    <div class="container space-y-6">
      <div>
        <div class="text-gray-title text-3xl font-extrabold">
          {{ bloc.title }}
        </div>
        <div
          v-if="bloc.subtitle"
          class="text-gray-plain"
        >
          {{ bloc.subtitle }}
        </div>
      </div>
      <div
        v-if="bloc.type === 'datasets_list'"
        class="grid sm:grid-cols-2 gap-5"
      >
        <DatasetCardLg
          v-for="dataset in bloc.datasets"
          :key="dataset.id"
          :dataset
        />
      </div>
      <div
        v-if="bloc.type === 'dataservices_list'"
        class="grid sm:grid-cols-2 gap-5"
      >
        <DataserviceCard
          v-for="dataservice in bloc.dataservices"
          :key="dataservice.id"
          :dataservice
        />
      </div>
      <div
        v-if="bloc.type === 'reuses_list'"
        class="grid sm:grid-cols-3 gap-5"
      >
        <ReuseCard
          v-for="reuse in bloc.reuses"
          :key="reuse.id"
          :reuse
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DataserviceCard, ReuseCard } from '@datagouv/components-next'
import type { Page } from '~/types/pages'

defineProps<{
  page: Page
}>()
</script>
