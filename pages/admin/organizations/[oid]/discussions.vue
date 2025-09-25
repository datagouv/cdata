<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Discussions') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-extrabold text-gray-title text-2xl mb-5">
      {{ t("Discussions") }}
    </h1>

    <DiscussionsPage
      v-if="currentOrganization"
      :organization="currentOrganization"
    />
  </div>
</template>

<script setup lang="ts">
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const { t } = useTranslation()

const { currentOrganization } = useCurrentOwned()
</script>
