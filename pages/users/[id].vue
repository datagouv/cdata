<template>
  <div
    v-if="user"
    class="container mb-16"
  >
    <div
      v-if="user"
      class="flex flex-wrap items-center justify-between"
    >
      <Breadcrumb>
        <BreadcrumbItem
          to="/"
          :external="true"
        >
          {{ $t('Accueil') }}
        </BreadcrumbItem>
        <BreadcrumbItem>
          {{ $t('Utilisateurs') }}
        </BreadcrumbItem>
        <BreadcrumbItem>
          {{ user.first_name }} {{ user.last_name }}
        </BreadcrumbItem>
      </Breadcrumb>
      <div class="flex flex-wrap gap-2.5 md:max-w-6/12">
        <BrandedButton
          v-if="me && me.id === user.id"
          href="/admin/me/profile"
          size="xs"
          :icon="RiEdit2Line"
        >
          {{ $t('Éditer mon profil') }}
        </BrandedButton>
        <EditButton
          v-else-if="me && isAdmin(me)"
          :id="user.id"
          type="users"
        />
        <DeleteUserModal
          v-if="isAdmin(me)"
          :user
        />
      </div>
    </div>
    <div class="mt-4 space-y-12">
      <div class="flex justify-between items-center gap-2">
        <div class="flex items-center space-x-8">
          <Avatar
            rounded
            :user
            class="shrink-0"
            :size="80"
          />
          <div>
            <h1 class="text-2xl text-gray-title font-extrabold mb-0">
              {{ user.first_name }} {{ user.last_name }}
            </h1>
            <CdataLink
              v-if="user.website"
              :href="user.website"
              external
              rel="ugc nofollow noopener"
            >
              {{ user.website }}
            </CdataLink>
          </div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <div class="flex flex-wrap gap-2">
            <AdminBadge
              size="xs"
              type="secondary"
            >
              {{ $t('{n} jeux de données', { n: user.metrics.datasets }) }}
            </AdminBadge>
            <AdminBadge
              size="xs"
              type="secondary"
            >
              {{ $t('{n} réutilisations | {n} réutilisation | {n} réutilisations', { n: user.metrics.reuses }) }}
            </AdminBadge>
            <AdminBadge
              size="xs"
              type="secondary"
            >
              {{ $t('{n} API', { n: user.metrics.dataservices }) }}
            </AdminBadge>
          </div>

          <div class="flex flex-wrap gap-2">
            <AdminBadge
              size="xs"
              type="secondary"
            >
              {{ $t('{n} abonnés | {n} abonné | {n} abonnés', { n: user.metrics.followers }) }}
            </AdminBadge>
            <AdminBadge
              size="xs"
              type="secondary"
            >
              {{ $t('{n} personnes suivies | 1 personne suivie | {n} personnes suivies', { n: user.metrics.following }) }}
            </AdminBadge>
          </div>
        </div>
      </div>

      <div v-if="user.organizations.length">
        <h2 class="text-sm font-bold uppercase mb-3">
          {{ $t('{n} organisations | {n} organisation | {n} organisations', { n: user.organizations.length }) }}
        </h2>

        <div class="grid md:grid-cols-3 gap-4">
          <OrganizationCard
            v-for="organization in user.organizations"
            :key="organization.id"
            class="min-w-0"
            :organization
          />
        </div>
      </div>

      <div v-if="user.about">
        <h2 class="text-sm font-bold uppercase mb-3">
          {{ $t('Description') }}
        </h2>
        <MarkdownViewer
          v-if="user.about"
          class="w-full"
          :content="user.about"
          :min-heading="2"
        />
      </div>

      <div
        v-if="user && datasets && datasets.total"
        class="space-y-3"
      >
        <h2 class="text-sm font-bold uppercase">
          {{ $t('{n} jeu de données | {n} jeux de données', { n: datasets.total }) }}
        </h2>

        <div class="grid grid-cols-1 gap-4">
          <DatasetCardLg
            v-for="dataset in datasets.data"
            :key="dataset.id"
            class="min-w-0"
            :dataset
          />
        </div>

        <Pagination
          :total-results="datasets.total"
          :page-size="datasets.page_size"
          :page="datasets.page"
          :link="getLink"
          @change="(newPage) => datasetsPage = newPage"
        />
      </div>

      <div
        v-if="user && reuses && reuses.total"
        class="space-y-3"
      >
        <h2 class="text-sm font-bold uppercase">
          {{ $t('{n} réutilisation | {n} réutilisations', { n: reuses.total }) }}
        </h2>

        <div class="grid sm:grid-cols-3 gap-4">
          <ReuseCard
            v-for="reuse in reuses.data"
            :key="reuse.id"
            class="min-w-0"
            :reuse
          />
        </div>

        <Pagination
          :total-results="reuses.total"
          :page-size="reuses.page_size"
          :page="reuses.page"
          :link="getLink"
          @change="(newPage) => reusesPage = newPage"
        />
      </div>

      <div
        v-if="user && followedDatasets && followedDatasets.total"
        class="space-y-3"
      >
        <h2 class="text-sm font-bold uppercase">
          {{ $t('{n} jeu de données suivi | {n} jeux de données suivis', { n: followedDatasets.total }) }}
        </h2>

        <div class="grid md:grid-cols-2 gap-4">
          <DatasetCardLg
            v-for="dataset in followedDatasets.data"
            :key="dataset.id"
            class="min-w-0"
            :dataset
          />
        </div>

        <Pagination
          :total-results="followedDatasets.total"
          :page-size="followedDatasets.page_size"
          :page="followedDatasets.page"
          :link="getLink"
          @change="(newPage) => followedDatasetsPage = newPage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Avatar, BrandedButton, OrganizationCard, Pagination, ReuseCard, type DatasetV2, type Reuse, type User } from '@datagouv/components-next'
import { RiEdit2Line } from '@remixicon/vue'
import { DatasetCardLg } from '#components'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import DeleteUserModal from '~/components/User/DeleteUserModal.vue'
import type { PaginatedArray } from '~/types/types'

const me = useMaybeMe()

const route = useRoute()
const url = computed(() => `/api/1/users/${route.params.id}`)
const { data: user } = await useAPI<User>(url, { redirectOn404: true, redirectOnSlug: 'id' })

const title = computed(() => user.value ? `${user.value.first_name} ${user.value.last_name}` : null)
useSeoMeta({
  robots: 'noindex, nofollow',
  title,
})

const datasetsPage = ref(1)
const datasetsParams = computed(() => {
  return {
    page: datasetsPage.value,
    page_size: 3,
    owner: user.value.id,
  }
})
const { data: datasets } = await useAPI<PaginatedArray<DatasetV2>>(`/api/2/datasets`, { query: datasetsParams })

const reusesPage = ref(1)
const reusesParams = computed(() => {
  return {
    page: reusesPage.value,
    page_size: 6,
    owner: user.value.id,
  }
})
const { data: reuses } = await useAPI<PaginatedArray<Reuse>>(`/api/1/reuses`, { query: reusesParams })

const followedDatasetsPage = ref(1)
const followedDatasetsParams = computed(() => {
  return {
    page: followedDatasetsPage.value,
    page_size: 6,
    followed_by: user.value.id,
  }
})
const { data: followedDatasets } = await useAPI<PaginatedArray<DatasetV2>>(`/api/2/datasets`, { query: followedDatasetsParams })
</script>
