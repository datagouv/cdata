<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Discussions') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-bold text-gray-title text-2xl mb-5">
      {{ t("Discussions") }}
    </h1>

    <DiscussionsPage
      v-if="currentOrganization"
      :organization="currentOrganization"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const { t } = useI18n()

const { currentOrganization } = useCurrentOwned()
</script>
