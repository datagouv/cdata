<template>
  <div>
    <div class="container">
      <Breadcrumb
        v-if="topic"
        class="mt-4 md:mb-0"
      >
        <BreadcrumbItem to="/">
          {{ $t('Accueil') }}
        </BreadcrumbItem>
        <BreadcrumbItem>
          {{ topic.name }}
        </BreadcrumbItem>
      </Breadcrumb>
    </div>

    <LoadingBlock
      v-if="topic"
      v-slot="{ data: topic }"
      :status
      :data="topic"
    >
      <div class="container py-10 min-h-32 space-y-8">
        <header class="space-y-3">
          <div
            v-if="topic.organization"
            class="flex gap-2 items-center"
          >
            <div class="bg-white p-1 rounded-xs border border-gray-default object-contain">
              <OrganizationLogo
                :organization="topic.organization"
                size-class="size-8"
              />
            </div>
            <CdataLink
              class="link block"
              :to="topic.organization.page"
            >
              <OrganizationNameWithCertificate
                :organization="topic.organization"
                as="h2"
              />
            </CdataLink>
          </div>
          <div
            v-else-if="topic.owner"
            class="flex gap-2 items-center"
          >
            <Avatar
              :user="topic.owner"
              :size="24"
              :rounded="true"
            />
            <CdataLink
              class="link block"
              :to="topic.owner.page"
            >
              {{ topic.owner.first_name }} {{ topic.owner.last_name }}
            </CdataLink>
          </div>

          <h1 class="text-2xl font-extrabold text-gray-title mb-0">
            {{ topic.name }}
          </h1>

          <p class="text-sm text-gray-medium m-0">
            {{ $t('Mis à jour {date}', { date: formatDate(topic.last_modified) }) }}
          </p>

          <div
            v-if="topic.tags.length"
            class="flex flex-wrap gap-0.5"
          >
            <span
              v-for="tag in topic.tags"
              :key="tag"
              class="text-xs px-2 py-1 rounded-xl bg-gray-default"
            >
              {{ tag }}
            </span>
          </div>
        </header>

        <MarkdownViewer
          v-if="topic.description"
          class="w-full min-w-0"
          :content="topic.description"
          :min-heading="3"
        />

        <section v-if="datasets && datasets.total">
          <h2 class="uppercase text-sm mb-2.5">
            {{ $t('aucun jeu de données associé | {n} jeu de données associé | {n} jeux de données associés', { n: datasets.total }) }}
          </h2>
          <div
            class="grid gap-5"
            :class="{ 'lg:grid-cols-2': datasets.total > 1 }"
          >
            <DatasetCardLg
              v-for="dataset in datasets.data"
              :key="dataset.id"
              :dataset="dataset"
              :show-description="datasets.total === 1"
              class="m-0 min-w-0"
            />
          </div>
          <Pagination
            class="mt-4"
            :page="datasetsPage"
            :page-size="datasetsPageSize"
            :total-results="datasets.total"
            @change="(changedPage: number) => datasetsPage = changedPage"
          />
        </section>

        <section v-if="reuses && reuses.total">
          <h2 class="uppercase text-sm mb-2.5">
            {{ $t('aucune réutilisation associée | {n} réutilisation associée | {n} réutilisations associées', { n: reuses.total }) }}
          </h2>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ReuseCard
              v-for="reuse in reuses.data"
              :key="reuse.id"
              class="min-w-0"
              :reuse="reuse"
            />
          </div>
          <Pagination
            class="mt-4"
            :page="reusesPage"
            :page-size="reusesPageSize"
            :total-results="reuses.total"
            @change="(changedPage: number) => reusesPage = changedPage"
          />
        </section>
      </div>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import { Avatar, getDescriptionShort, LoadingBlock, MarkdownViewer, OrganizationLogo, OrganizationNameWithCertificate, Pagination, useFormatDate, type DatasetV2, type Reuse, type TopicV2 } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ReuseCard from '~/components/Reuses/ReuseCard.vue'
import type { PaginatedArray } from '~/types/types'

const route = useRoute()
const config = useRuntimeConfig()

const { formatDate } = useFormatDate()

const url = computed(() => `/api/2/topics/${route.params.id}/`)
const { data: topic, status } = await useAPI<TopicV2>(url, { redirectOn404: true, redirectOnSlug: 'id' })

const datasetsPage = ref(1)
const datasetsPageSize = ref(10)
const datasetsQuery = computed(() => ({
  page: datasetsPage.value,
  page_size: datasetsPageSize.value,
  // Filter by the topic id: the datasets endpoint rejects the slug, and route.params.id
  // is replaced by the slug after redirectOnSlug.
  topic: topic.value?.id,
}))
const { data: datasets } = await useAPI<PaginatedArray<DatasetV2>>('/api/2/datasets/', { query: datasetsQuery })

const reusesPage = ref(1)
const reusesPageSize = ref(9)
const reusesQuery = computed(() => ({
  page: reusesPage.value,
  page_size: reusesPageSize.value,
  topic: topic.value?.id,
}))
const { data: reuses } = await useAPI<PaginatedArray<Reuse>>('/api/2/reuses/search/', {
  headers: { 'X-Fields': reusesXFields },
  query: reusesQuery,
})

const title = computed(() => `${topic.value?.name} | ${config.public.title}`)
const description = computed(() => topic.value ? getDescriptionShort(topic.value) : '')

useSeoMeta({
  title,
  description,
})
</script>
