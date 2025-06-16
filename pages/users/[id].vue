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
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-8">
          <Avatar
            rounded
            :user
            class="shrink-0"
            :size="80"
          />
          <div>
            <h1 class="mb-0">
              {{ user.first_name }} {{ user.last_name }}
            </h1>
            <NuxtLink
              v-if="user.website"
              :href="user.website"
              external
              rel="ugc nofollow noopener"
            >{{ user.website }}</NuxtLink>
          </div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <div class="flex gap-2">
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
              {{ $t('{n} réutilisations', { n: user.metrics.reuses }) }}
            </AdminBadge>
            <AdminBadge
              size="xs"
              type="secondary"
            >
              {{ $t('{n} API', { n: user.metrics.dataservices }) }}
            </AdminBadge>
          </div>

          <div class="flex gap-2">
            <AdminBadge
              size="xs"
              type="secondary"
            >
              {{ $t('{n} abonnés', { n: user.metrics.followers }) }}
            </AdminBadge>
            <AdminBadge
              size="xs"
              type="secondary"
            >
              {{ $t('{n} personnes suivies', { n: user.metrics.following }) }}
            </AdminBadge>
          </div>
        </div>
      </div>

      <div v-if="user.organizations.length">
        <h2 class="text-sm font-bold uppercase mb-3">
          {{ $t('{n} organisation | {n} organizations', { n: user.organizations.length }) }}
        </h2>

        <div class="grid md:grid-cols-3 gap-4">
          <OrganizationCard
            v-for="organization in user.organizations"
            :key="organization.id"
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
          {{ $t('{n} jeu de données suivi | {n} jeux de données suivis', { n: datasets.total }) }}
        </h2>

        <div class="grid md:grid-cols-2 gap-4">
          <DatasetCardLg
            v-for="dataset in datasets.data"
            :key="dataset.id"
            :dataset
          />
        </div>

        <Pagination
          :total-results="datasets.total"
          :page-size="datasets.page_size"
          :page="datasets.page"
          :link="getLink"
          @change="(newPage) => datasetPage = newPage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Avatar, BrandedButton, OrganizationCard, Pagination, type DatasetV2, type User } from '@datagouv/components-next'
import { RiEdit2Line } from '@remixicon/vue'
import { DatasetCardLg } from '#components'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import DeleteUserModal from '~/components/User/DeleteUserModal.vue'
import type { PaginatedArray } from '~/types/types'

const me = useMaybeMe()

const route = useRoute()
const url = computed(() => `/api/1/users/${route.params.id}`)
const { data: user } = await useAPI<User>(url)

const datasetPage = ref(1)
const datasetsParams = computed(() => {
  return {
    page: datasetPage.value,
    followed_by: user.value.id,
  }
})
const { data: datasets } = await useAPI<PaginatedArray<DatasetV2>>(`/api/2/datasets`, { query: datasetsParams })
const title = computed(() => user.value ? `${user.value.first_name} ${user.value.last_name}` : null)
useSeoMeta({
  robots: 'noindex, nofollow',
  title,
})
</script>
