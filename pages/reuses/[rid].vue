<!-- eslint-disable vue/no-v-html -->
<template>
  <div>
    <div class="container">
      <div
        v-if="reuse"
        class="mt-4 flex gap-4 flex-wrap md:flex-nowrap items-center justify-between"
      >
        <Breadcrumb class="md:mb-0 md:mt-0">
          <BreadcrumbItem
            to="/"
            :external="true"
          >
            {{ $t('Accueil') }}
          </BreadcrumbItem>
          <BreadcrumbItem to="/reuses">
            {{ $t('Réutilisations') }}
          </BreadcrumbItem>
          <BreadcrumbItem>
            {{ reuse.title }}
          </BreadcrumbItem>
        </Breadcrumb>
        <div class="max-w-full flex-none flex gap-2.5 flex-wrap md:max-w-6/12">
          <FollowButton
            v-if="reuse"
            :url="`/api/1/reuses/${reuse.id}/followers/`"
          />
          <div v-if="!reuse.archived">
            <BrandedButton
              :href="reuse.url"
              :new-tab="true"
              size="xs"
              class="hidden md:block"
              @click="$matomo.trackEvent('Réutilisation', `Voir la réutilisation`, 'Bouton :  voir la reutilisation')"
            >
              {{ $t('Voir la réutilisation') }}
            </BrandedButton>
          </div>
          <EditButton
            v-if="reuse.permissions.edit"
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
    <LoadingBlock
      v-if="reuse"
      :status
    >
      <div class="container py-10 min-h-32">
        <div class="grid md:grid-cols-12 gap-4">
          <div class="md:col-span-5 flex flex-col justify-center">
            <div class="flex gap-3 mb-2">
              <AdminBadge
                v-if="reuse.deleted"
                :icon="RiDeleteBinLine"
                size="sm"
                type="secondary"
              >
                {{ $t('Supprimé') }}
              </AdminBadge>
              <AdminBadge
                v-if="reuse.private"
                :icon="RiLockLine"
                size="sm"
                type="secondary"
              >
                {{ $t('Brouillon') }}
              </AdminBadge>
              <AdminBadge
                v-if="reuse.archived"
                :icon="RiLockLine"
                size="sm"
                type="secondary"
              >
                {{ $t('Archivé') }}
              </AdminBadge>
            </div>
            <div
              v-if="reuse.organization"
              class="flex gap-2 items-center"
            >
              <div class="bg-white p-1 rounded-xs border border-gray-default object-contain">
                <OrganizationLogo
                  :organization="reuse.organization"
                  size-class="size-8"
                />
              </div>
              <CdataLink
                class="link block"
                :to="`/organizations/${reuse.organization.slug}/`"
              >
                <OrganizationNameWithCertificate
                  :organization="reuse.organization"
                />
              </CdataLink>
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
              <CdataLink
                class="link block"
                :to="`/users/${reuse.owner.slug}/`"
                :external="true"
              >
                {{ reuse.owner.first_name }} {{ reuse.owner.last_name }}
              </CdataLink>
            </div>
            <h1 class="text-2xl font-extrabold text-gray-title mb-1">
              {{ reuse.title }}
            </h1>
            <ReuseDetails
              :reuse
              class="mt-1 mb-0"
            />
            <div
              v-if="!reuse.archived"
              class="mt-6"
            >
              <BrandedButton
                size="xs"
                :href="reuse.url"
                :new-tab="true"
                @click="$matomo.trackEvent('Réutilisation', `Voir la réutilisation`, 'Bouton : voir la reutilisation')"
              >
                {{ $t('Voir la réutilisation') }}
              </BrandedButton>
            </div>
          </div>
          <div class="w-7/12 md:w-full md:col-span-7">
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
import { isOrganizationCertified, Avatar, BrandedButton, LoadingBlock, OrganizationNameWithCertificate, ReuseDetails, type Reuse, OrganizationLogo } from '@datagouv/components-next'
import { RiDeleteBinLine, RiLockLine } from '@remixicon/vue'
import AdminBadge from '~/components/AdminBadge/AdminBadge.vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ReportModal from '~/components/Spam/ReportModal.vue'

const route = useRoute()

const url = computed(() => `/api/1/reuses/${route.params.rid}/`)
const { data: reuse, status } = await useAPI<Reuse>(url, { redirectOn404: true, redirectOnSlug: 'rid' })

const title = computed(() => reuse.value?.title)
const robots = computed(() => reuse.value && !reuse.value.metrics.datasets && !reuse.value.metrics.datasets ? 'noindex, nofollow' : 'all')

useSeoMeta({
  title,
  robots,
})

onMounted(async () => {
  await redirectLegacyHashes([
    { from: 'discussions', to: `/reuses/${route.params.did}/discussions/`, queryParam: 'discussion_id' },
    { from: 'discussion', to: `/reuses/${route.params.did}/discussions/`, queryParam: 'discussion_id' },
  ])
})
</script>
