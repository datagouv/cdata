<template>
  <NotificationLayout
    :icon="harvesterIcon"
    :title="statusLabel"
    :notification="notification"
    :requires-action="notification.details.status === 'pending'"
    :title-link="`/admin/harvesters/${notification.details.source.id}`"
    :title-link-title="$t('Voir le moissonneur')"
  >
    <p class="m-0 text-xs">
      {{ notification.details.source.name }}
    </p>
  </NotificationLayout>
</template>

<script setup lang="ts">
import { RiCheckboxCircleLine, RiCloseCircleLine, RiLinkUnlink } from '@remixicon/vue'
import { throwOnNever } from '@datagouv/components-next'
import type { ValidateHarvesterNotification } from '~/types/notifications'
import NotificationLayout from './NotificationLayout.vue'

const props = defineProps<{
  notification: ValidateHarvesterNotification
}>()

const { t } = useTranslation()

const statusLabel = computed(() => {
  switch (props.notification.details.status) {
    case 'accepted':
      return t('Moissonneur validé')
    case 'refused':
      return t('Moissonneur refusé')
    case 'pending':
      return t('Moissonneur en attente de validation')
    default:
      return throwOnNever(props.notification.details.status, 'No other status')
  }
})

const harvesterIcon = computed(() => {
  switch (props.notification.details.status) {
    case 'accepted':
      return RiCheckboxCircleLine
    case 'refused':
      return RiCloseCircleLine
    default:
      return RiLinkUnlink
  }
})
</script>
