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
      {{ $t('Les statistiques sont comptabilisées à partir de ') }}
      {{ formatDate(config.public.metricsSince, { dateStyle: undefined, year: 'numeric', month: 'long', day: undefined }) }}.
      <br>
      <span v-if="new Date().getHours() > 7 - 1">{{ $t('Mises à jour ce matin.') }}</span>
      <span v-else>{{ $t('Mises à jour hier.') }}</span>
    </p>

    <TabLinks
      class="mb-5"
      :links="[
        { href: metricsUrl, label: organization ? $t('Organisation') : $t('Utilisateur') },
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
import { useFormatDate, type Organization, type User } from '@datagouv/components-next'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const props = defineProps<{
  organization?: Organization | null
  user?: User | null
}>()

definePageMeta({
  keepScroll: true,
})

defineEmits<{
  refresh: []
}>()

const config = useRuntimeConfig()
const { formatDate } = useFormatDate()

const me = useMe()

const metricsUrl = computed(() => {
  if (props.organization) {
    return `/admin/organizations/${props.organization?.id}/metrics`
  }
  if (props.user) {
    if (props.user.id === me.value.id) {
      return '/admin/me/metrics'
    }
    return `/admin/users/${props.user?.id}/metrics`
  }
  throw Error('The page should be called with an organization or a user')
})
</script>
