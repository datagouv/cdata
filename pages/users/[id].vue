<template>
  <div class="container mb-16">
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
      <BreadcrumbItem v-if="user">
        {{ user.first_name }} {{ user.last_name }}
      </BreadcrumbItem>
    </Breadcrumb>

    <div class="flex justify-between items-center mb-8" v-if="user">
        <div class="flex items-center space-x-8" >
            <Avatar rounded :user class="shrink-0" :size="80" />
            <div>
                <h1 class="mb-0">
                  {{ user.first_name }} {{ user.last_name }}
                </h1>
                <NuxtLink v-if="user.website" :href="user.website" external noindex>{{ user.website }}</NuxtLink>
            </div>
        </div>
        <div class="flex flex-col items-end gap-2">
            <div class="flex gap-2">
                <AdminBadge size="xs" type="secondary">{{ $t('{n} jeux de données', { n: user.metrics.datasets }) }}</AdminBadge>
                <AdminBadge size="xs" type="secondary">{{ $t('{n} réutilisations', { n: user.metrics.reuses }) }}</AdminBadge>
                <AdminBadge size="xs" type="secondary">{{ $t('{n} API', { n: user.metrics.dataservices }) }}</AdminBadge>
            </div>

            <div class="flex gap-2">
                <AdminBadge size="xs" type="secondary">{{ $t('{n} abonnés', { n: user.metrics.followers }) }}</AdminBadge>
                <AdminBadge size="xs" type="secondary">{{ $t('{n} personnes suivies', { n: user.metrics.following }) }}</AdminBadge>
            </div>
        </div>
    </div>

    <div v-if="user && user.organizations.length" class="grid md:grid-cols-3 gap-4">
        <OrganizationCard v-for="organization in user.organizations" :organization :key="organization.id" />
    </div>

    <MarkdownViewer
        v-if="user && user.about"
        class="w-full"
        :content="user.about"
        :min-heading="2"
    />
</div>
</template>

<script setup lang="ts">
import { Avatar, OrganizationCard, type User } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'


const route = useRoute()
const url = computed(() => `/api/1/users/${route.params.id}`)
const { data: user } = await useAPI<User>(url)
</script>
