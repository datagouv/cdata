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
        v-if="bloc.class === 'DatasetsListBloc'"
        class="grid sm:grid-cols-2 gap-5"
      >
        <DatasetCardLg
          v-for="dataset in bloc.datasets"
          :key="dataset.id"
          class="min-w-0"
          :dataset
        />
      </div>
      <div
        v-if="bloc.class === 'DataservicesListBloc'"
        class="grid sm:grid-cols-2 gap-5"
      >
        <DataserviceCard
          v-for="dataservice in bloc.dataservices"
          :key="dataservice.id"
          class="min-w-0"
          :dataservice
        />
      </div>
      <div
        v-if="bloc.class === 'ReusesListBloc'"
        class="grid sm:grid-cols-3 gap-5"
      >
        <ReuseCard
          v-for="reuse in bloc.reuses"
          :key="reuse.id"
          class="min-w-0"
          :reuse
        />
      </div>
      <div
        v-if="bloc.class === 'LinksListBloc'"
        class="flex flex-col sm:flex-row gap-8 sm:gap-16"
      >
        <div
          v-if="bloc.paragraph"
          class="w-full"
        >
          <p class="mb-0 font-light text-2xl">
            {{ bloc.paragraph }}
          </p>

          <BrandedButton
            v-if="bloc.main_link_title && bloc.main_link_url"
            :href="bloc.main_link_url"
            class="mt-12"
            :color="mainColor"
          >
            {{ bloc.main_link_title }}
          </BrandedButton>
        </div>
        <div class="space-y-8 w-full">
          <div
            v-for="link in bloc.links"
            :key="link.title"
          >
            <CdataLink
              class="hyphens-auto inline-flex items-start relative font-extrabold text-[var(--link-color)] no-underline hover:underline fr-raw-link"
              :class="[bloc.paragraph ? 'text-6xl' : 'text-7xl']"
              :style="{
                '--link-color': link.color,
              }"
              :href="link.url"
            >
              {{ link.title }}
              <RiArrowRightUpLine class="size-9" />
            </CdataLink>
          </div>
          <BrandedButton
            v-if="! bloc.paragraph && bloc.main_link_title && bloc.main_link_url"
            :href="bloc.main_link_url"
            class="mt-12"
            :color="mainColor"
          >
            {{ bloc.main_link_title }}
          </BrandedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentProps } from 'vue-component-type-helpers'
import { BrandedButton, DataserviceCard, ReuseCard } from '@datagouv/components-next'
import { RiArrowRightUpLine } from '@remixicon/vue'
import CdataLink from '../CdataLink.vue'
import type { Page } from '~/types/pages'

withDefaults(defineProps<{
  page: Page
  mainColor?: ComponentProps<typeof BrandedButton>['color']
}>(), {
  mainColor: 'primary',
})
</script>
