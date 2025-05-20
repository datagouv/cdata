<template>
  <div class="container mb-16" v-if="user">
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
            <BrandedButton href="/admin/me/profile" size="xs" :icon="RiEdit2Line" v-if="me && me.id === user.id">
                {{ $t('Éditer mon profil') }}
            </BrandedButton>
            <EditButton
              v-else-if="me && isAdmin(me)"
              
              :id="user.id"
              type="users"
            />
        </div>
    </div>
    <div class="space-y-8">
        <div class="flex justify-between items-center">
            <div class="flex items-center space-x-8" >
                <Avatar rounded :user class="shrink-0" :size="80" />
                <div>
                    <h1 class="mb-0">
                      {{ user.first_name }} {{ user.last_name }}
                    </h1>
                    <NuxtLink v-if="user.website" :href="user.website" external rel="ugc nofollow noopener">{{ user.website }}</NuxtLink>
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
    
        <div v-if="user.organizations.length" class="grid md:grid-cols-3 gap-4">
            <OrganizationCard v-for="organization in user.organizations" :organization :key="organization.id" />
        </div>
    
        <MarkdownViewer
            v-if="user.about"
            class="w-full"
            :content="user.about"
            :min-heading="2"
        />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Avatar, BrandedButton, OrganizationCard, type User } from '@datagouv/components-next'
import { RiEdit2Line } from '@remixicon/vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import EditButton from '~/components/Buttons/EditButton.vue'

useSeoMeta({
  robots: "nofollow",
})

const me = useMaybeMe()

const route = useRoute()
const url = computed(() => `/api/1/users/${route.params.id}`)
const { data: user } = await useAPI<User>(url)
</script>
