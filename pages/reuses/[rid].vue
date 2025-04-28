<!-- eslint-disable vue/no-v-html -->
<template>
  <div>
    <div class="container">
      <div
        v-if="reuse"
        class="flex flex-wrap items-center justify-between"
      >
        <Breadcrumb>
          <BreadcrumbItem
            to="/"
            :external="true"
          >
            {{ $t('Home') }}
          </BreadcrumbItem>
          <BreadcrumbItem to="/reuses">
            {{ $t('Reuses') }}
          </BreadcrumbItem>
          <BreadcrumbItem>
            {{ reuse.title }}
          </BreadcrumbItem>
        </Breadcrumb>
        <div class="flex flex-wrap gap-2.5 md:max-w-6/12">
          <FollowButton
            v-if="follower"
            :following="follower.total > 0"
            :url="`api/1/reuses/${reuse.id}/followers/`"
          />
          <BrandedButton
            :href="reuse.url"
            :new-tab="true"
            size="xs"
          >
            {{ $t('See the reuse') }}
          </BrandedButton>
          <EditButton
            v-if="isAdmin(me)"
            :id="reuse.id"
            type="reuses"
          />
        </div>
      </div>
    </div>
    <LoadingBlock
      v-if="reuse"
      :status
    >
      <div class="container pt-10 min-h-32">
        <div class="flex flex-wrap">
          <div class="w-full md:w-5/12 flex flex-col justify-center">
            <p
              v-if="reuse.deleted"
              class="fr-badge mb-2 flex gap-1 items-center"
            >
              <RiDeleteBinLine class="size-3.5" />
              {{ $t('Deleted') }}
            </p>
            <div
              v-if="reuse.organization"
              class="flex gap-2 items-center"
            >
              <Placeholder
                :src="reuse.organization.logo_thumbnail"
                type="organization"
                alt=""
                :size="32"
                class="bg-white p-1 rounded-xs border border-gray-default object-contain"
              />
              <NuxtLinkLocale
                class="link block"
                :to="`/organizations/${reuse.organization.slug}/`"
              >
                <OrganizationNameWithCertificate
                  :organization="reuse.organization"
                />
              </NuxtLinkLocale>
            </div>
            <h1 class="!text-2xl !font-extrabold !mb-1">
              {{ reuse.title }}
            </h1>
            <ReuseDetails
              :reuse
              class="mt-1 mb-0"
            />
            <div class="mt-6">
              <BrandedButton
                size="xs"
                :href="reuse.url"
                :new-tab="true"
              >
                {{ $t('See reuse') }}
              </BrandedButton>
            </div>
          </div>
          <div class="w-7/12">
            <NuxtImg
              class="w-full object-contain max-h-[400px]"
              :src="reuse.image ?? undefined"
            />
          </div>
        </div>
        <Divider
          class="my-5"
          color="border-gray-default"
        />
      </div>
      <FullPageTabs
        :links="[
          { label: $t('Description'), href: `/reuses/${route.params.rid}/` },
          { label: $t('Discussions'), href: `/reuses/${route.params.rid}/discussions/`, count: reuse.metrics.discussions ?? 0 },
        ]"
      />
      <div
        id="page"
        class="bg-white pt-5 pb-8 lg:pb-24"
      >
        <NuxtPage
          v-if="reuse"
          class="container"
          :reuse
        />
      </div>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, OrganizationNameWithCertificate, type Reuse } from '@datagouv/components-next'
import { RiDeleteBinLine } from '@remixicon/vue'
import EditButton from '~/components/BrandedButton/EditButton.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ReuseDetails from '~/datagouv-components/src/components/ReuseDetails.vue'
import type { PaginatedArray } from '~/types/types'

const route = useRoute()
const me = useMaybeMe()

const url = computed(() => `/api/1/reuses/${route.params.rid}/`)
const { data: reuse, status } = await useAPI<Reuse>(url)

const followUrl = computed(() => `/api/1/reuses/${reuse.value.id}/followers/`)
const { data: follower, followStatus } = await useAPI<PaginatedArray<{
  id: string
  follower: string
  since: string
}>>(followUrl, {
  query: {
    user: me.value?.id ?? undefined,
  },
})

const title = computed(() => reuse.value?.title)
const robots = computed(() => reuse.value && !reuse.value.metrics.datasets && !reuse.value.metrics.datasets ? 'noindex, nofollow' : 'all')

useSeoMeta({
  title,
  robots,
})
</script>
