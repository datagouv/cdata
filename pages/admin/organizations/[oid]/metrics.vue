<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem
        :to="metricsUrl"
      >
        {{ $t('Statistiques') }}
      </BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-extrabold text-gray-title text-2xl mb-5">
      {{ $t("Statistiques") }}
    </h1>

    <p class="text-sm text-gray-medium my-5">
      {{ $t('Les statistiques sont comptabilisées à partir de juillet 2022.') }}<br>
      <span v-if="new Date().getHours() > 7 - 1">{{ $t('Mises à jour ce matin') }}</span>
      <span v-else>{{ $t('Mises à jour hier') }}</span>
    </p>

    <TabLinks
      class="mb-5"
      :links="[
        { href: metricsUrl, label: $t('Organisation') },
        { href: `${metricsUrl}/datasets/`, label: $t('Jeux de données') },
        { href: `${metricsUrl}/dataservices/`, label: $t('API') },
        { href: `${metricsUrl}/reuses/`, label: $t('Réutilisations') },
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
import { useFormatDate, type Organization } from '@datagouv/components-next'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const props = defineProps<{
  organization: Organization
}>()

defineEmits<{
  refresh: []
}>()

const { formatDate: _formatDate } = useFormatDate()

const metricsUrl = computed(() => `/admin/organizations/${props.organization?.id}/metrics`)
</script>
