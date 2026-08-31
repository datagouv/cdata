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
      <FormattedDate
        :date="config.public.metricsSince"
        :options="{ dateStyle: undefined, year: 'numeric', month: 'long', day: undefined }"
      />.
      <br>
      <span v-if="metricsUpdatedToday">{{ $t('Mises à jour ce matin.') }}</span>
      <span v-else>{{ $t('Mises à jour hier.') }}</span>
    </p>

    <div class="flex flex-wrap items-center gap-4 mb-5">
      <TabLinks
        :links="[
          { href: metricsUrl, label: organization ? $t('Organisation') : $t('Utilisateur') },
          { href: `${metricsUrl}/datasets/`, label: $t('Jeux de données') },
          { href: `${metricsUrl}/dataservices/`, label: $t('API') },
          { href: `${metricsUrl}/reuses/`, label: $t('Réutilisations') },
        ]"
      />
      <div
        id="metrics-actions"
        class="flex flex-wrap items-center gap-4 ml-auto"
      />
    </div>

    <NuxtPage
      :page-key="route => route.fullPath"
      :organization
      @refresh="$emit('refresh')"
    />
  </div>
</template>

<script setup lang="ts">
import { FormattedDate, type Organization, type User } from '@datagouv/components-next'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const props = defineProps<{
  organization?: Organization | null
  user?: User | null
}>()

defineEmits<{
  refresh: []
}>()

const config = useRuntimeConfig()

const me = useMe()

// The metrics batch runs at 7am Paris time, so the cutoff is in that timezone, not the reader's.
// `hourCycle: 'h23'` rather than `hour12: false`, which renders midnight as 24 on some ICU builds.
const metricsUpdatedToday = computed(() =>
  Number(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris', hour: '2-digit', hourCycle: 'h23' })) >= 7,
)

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
