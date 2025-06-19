<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ $t('Statistiques') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-bold text-2xl mb-5">
      {{ $t("Statistiques") }}
    </h1>

    <TabLinks
      class="mb-5"
      :links="[
        { href: localPath(metricsUrl), label: $t('Organisation') },
        { href: localPath(`${metricsUrl}/datasets/`), label: $t('Jeux de données') },
        { href: localPath(`${metricsUrl}/dataservices/`), label: $t('API') },
        { href: localPath(`${metricsUrl}/reuses/`), label: $t('Réutilisation') },
      ]"
    />

    <NuxtPage
      :page-key="route => route.fullPath"
      :organization
      @refresh="$emit('refresh')"
    />
  </div>
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const props = defineProps<{
  organization: Organization
}>()

defineEmits<{
  refresh: []
}>()

const localPath = useLocalePath()

const metricsUrl = computed(() => `/admin/organizations/${props.organization?.id}/metrics`)
</script>
