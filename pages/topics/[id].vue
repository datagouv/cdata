<template>
  <div>
    <div class="container">
      <div
        v-if="topic"
        class="mt-4 flex gap-4 flex-wrap md:flex-nowrap items-center justify-between"
      >
        <Breadcrumb class="md:my-0">
          <BreadcrumbItem to="/">
            {{ $t('Accueil') }}
          </BreadcrumbItem>
          <BreadcrumbItem>
            {{ topic.name }}
          </BreadcrumbItem>
        </Breadcrumb>
        <EditButton
          v-if="isMeAdmin()"
          :id="topic.id"
          type="topics"
        />
      </div>
    </div>

    <LoadingBlock
      v-if="topic"
      v-slot="{ data: topic }"
      :status
      :data="topic"
    >
      <div class="container py-10 min-h-32">
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
      </div>

      <FullPageTabs
        :links="[
          { label: $t('Description'), href: `/topics/${route.params.id}` },
          { label: $t('Discussions'), href: `/topics/${route.params.id}/discussions`, count: discussionsCount },
        ]"
      />
      <div
        id="page"
        class="bg-white pt-5 pb-8"
      >
        <NuxtPage
          class="container"
          :topic
        />
      </div>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import { Avatar, getDescriptionShort, LoadingBlock, OrganizationLogo, OrganizationNameWithCertificate, useFormatDate, type TopicV2 } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import type { Thread } from '~/types/discussions'
import type { PaginatedArray } from '~/types/types'

definePageMeta({
  keepScroll: true,
})

const route = useRoute()
const config = useRuntimeConfig()

const { formatDate } = useFormatDate()

const url = computed(() => `/api/2/topics/${route.params.id}/`)
const { data: topic, status } = await useAPI<TopicV2>(url, { redirectOn404: true, redirectOnSlug: 'id' })

const { data: discussions } = await useAPI<PaginatedArray<Thread>>('/api/1/discussions/', {
  query: { for: topic.value?.id, page_size: 1 },
})
const discussionsCount = computed(() => discussions.value?.total ?? 0)

const title = computed(() => `${topic.value?.name} | ${config.public.title}`)
const description = computed(() => topic.value ? getDescriptionShort(topic.value) : '')

useSeoMeta({
  title,
  description,
})
</script>
