<template>
  <div
    v-for="(bloc, index) in page.blocs"
    :key="index"
    class="py-24 odd:bg-gray-some"
  >
    <div class="container space-y-6">
      <div class="space-y-2.5">
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
        v-if="bloc.type === 'DatasetsListBloc'"
        class="grid sm:grid-cols-2 gap-5"
      >
        <DatasetCardLg
          v-for="dataset in bloc.datasets"
          :key="dataset.id"
          :dataset
        />
      </div>
      <div
        v-if="bloc.type === 'DataservicesListBloc'"
        class="grid sm:grid-cols-2 gap-5"
      >
        <DataserviceCard
          v-for="dataservice in bloc.dataservices"
          :key="dataservice.id"
          :dataservice
        />
      </div>
      <div
        v-if="bloc.type === 'ReusesListBloc'"
        class="grid sm:grid-cols-3 gap-5"
      >
        <ReuseCard
          v-for="reuse in bloc.reuses"
          :key="reuse.id"
          :reuse
        />
      </div>
      <div
        v-if="bloc.type === 'LinksListBloc'"
        class="flex flex-col sm:flex-row gap-8 sm:gap-16"
      >
        <p
          v-if="bloc.paragraph"
          class="mb-0 w-full font-light text-2xl"
        >
          {{ bloc.paragraph }}
        </p>
        <div class="space-y-8 w-full">
          <div
            v-for="link in bloc.links"
            :key="link.title"
          >
            <CdataLink
              class="inline-block relative font-extrabold text-[var(--link-color)] no-underline hover:underline fr-raw-link"
              :class="[bloc.paragraph ? 'text-6xl' : 'text-7xl']"
              :style="{
                '--link-color': link.color,
              }"
              :href="link.url"
            >
              {{ link.title }}
              <RiArrowRightUpLine class="absolute top-0 -right-9 size-9" />
            </CdataLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DataserviceCard, ReuseCard } from '@datagouv/components-next'
import { RiArrowRightUpLine } from '@remixicon/vue'
import CdataLink from '../CdataLink.vue'
import type { Page } from '~/types/pages'

defineProps<{
  page: Page
}>()
</script>
