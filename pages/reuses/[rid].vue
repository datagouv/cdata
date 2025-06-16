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
            v-if="reuse"
            :url="`/api/1/reuses/${reuse.id}/followers/`"
          />
          <div>
            <BrandedButton
              :href="reuse.url"
              :new-tab="true"
              size="xs"
            >
              {{ $t('See the reuse') }}
            </BrandedButton>
          </div>
          <div class="flex gap-3 items-center">
            <EditButton
              v-if="isMeAdmin() || reuse.permissions.edit"
              :id="reuse.id"
              type="reuses"
            />
            <ReportModal
              v-if="!isOrganizationCertified(reuse.organization)"
              :subject="{ id: reuse.id, class: 'Reuse' }"
            />
          </div>
        </div>
      </div>
    </div>
    <LoadingBlock
      v-if="reuse"
      :status
    >
      <div class="container py-10 min-h-32">
        <div class="flex flex-wrap">
          <div class="w-full md:w-5/12 flex flex-col justify-center">
            <div class="flex gap-3 mb-2">
              <AdminBadge
                v-if="reuse.deleted"
                :icon="RiDeleteBinLine"
                size="sm"
                type="secondary"
              >
                {{ $t('Deleted') }}
              </AdminBadge>
              <AdminBadge
                v-if="reuse.private"
                :icon="RiLockLine"
                size="sm"
                type="secondary"
              >
                {{ $t('Draft') }}
              </AdminBadge>
              <AdminBadge
                v-if="reuse.archived"
                :icon="RiLockLine"
                size="sm"
                type="secondary"
              >
                {{ $t('Archived') }}
              </AdminBadge>
            </div>
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
            <div
              v-else-if="reuse.owner"
              class="flex gap-2 items-center"
            >
              <Avatar
                :user="reuse.owner"
                :size="24"
                :rounded="true"
              />
              <NuxtLinkLocale
                class="link block"
                :to="`/users/${reuse.owner.slug}/`"
                :external="true"
              >
                {{ reuse.owner.first_name }} {{ reuse.owner.last_name }}
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
      </div>
      <FullPageTabs
        :links="[
          { label: $t('Description'), href: `/reuses/${route.params.rid}/` },
          { label: $t('Discussions'), href: `/reuses/${route.params.rid}/discussions/`, count: reuse.metrics.discussions ?? 0 },
        ]"
      />
      <div
        id="page"
        class="bg-white pt-5 pb-8"
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
import { isOrganizationCertified, Avatar, BrandedButton, OrganizationNameWithCertificate, type Reuse } from '@datagouv/components-next'
import { RiDeleteBinLine, RiLockLine } from '@remixicon/vue'
import AdminBadge from '~/components/AdminBadge/AdminBadge.vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ReportModal from '~/components/Spam/ReportModal.vue'
import ReuseDetails from '~/datagouv-components/src/components/ReuseDetails.vue'

const route = useRoute()

const url = computed(() => `/api/1/reuses/${route.params.rid}/`)
const { data: reuse, status } = await useAPI<Reuse | null>(url)

const title = computed(() => reuse.value?.title)
const robots = computed(() => reuse.value && !reuse.value.metrics.datasets && !reuse.value.metrics.datasets ? 'noindex, nofollow' : 'all')

useSeoMeta({
  title,
  robots,
})
</script>
