<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Tableau de bord des aperçus') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-extrabold text-2xl text-gray-title mb-5">
      {{ t('Tableau de bord des aperçus') }}
    </h1>

    <TabLinks
      class="mb-5"
      :links="[
        { href: BASE_PATH, label: t('Statistique') },
        { href: filesHref, label: t('Fichiers') },
      ]"
    />

    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import TabLinks from '~/components/TabLinks.vue'

const { t } = useTranslation()
const route = useRoute()

const BASE_PATH = '/admin/beta/preview-dashboard'
const FILES_PATH = `${BASE_PATH}/fichiers`

// TabLinks highlights the active tab by comparing full paths, query included,
// so the link has to carry the filters the Fichiers page was reached with.
const filesHref = computed(() => route.path === FILES_PATH ? route.fullPath : FILES_PATH)
</script>
