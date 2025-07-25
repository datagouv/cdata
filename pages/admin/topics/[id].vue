<template>
  <div v-if="topic">
    <AdminBreadcrumb>
      <BreadcrumbItem to="/admin/site/topics">
        {{ $t('Thématiques') }}
      </BreadcrumbItem>
      <BreadcrumbItem v-if="topic">
        {{ topic.name }}
      </BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="text-2xl font-bold text-gray-title !mb-5">
      {{ topic.name }}
    </h1>

    <TabLinks
      class="mb-5"
      :links="[
        { href: `/admin/topics/${topic.id}`, label: $t('Métadonnées') },
        { href: `/admin/topics/${topic.id}/datasets`, label: $t('Jeux de données') },
        { href: `/admin/topics/${topic.id}/reuses`, label: $t('Réutilisations') },
        { href: `/admin/topics/${topic.id}/activities`, label: $t('Activités') },
      ]"
    />

    <NuxtPage
      :topic
      @refreh="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import type { TopicV2 } from '@datagouv/components-next'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const route = useRoute()
const { data: topic, refresh } = await useAPI<TopicV2>(`api/2/topics/${route.params.id}/`, { redirectOn404: true })
</script>
