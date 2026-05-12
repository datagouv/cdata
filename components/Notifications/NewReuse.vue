<template>
  <NotificationLayout
    :icon="RiLineChartLine"
    :title="$t('Nouvelle Réutilisation')"
    :notification="notification"
    :requires-action="false"
    :title-link="notification.details.reuse.page"
    :title-link-title="$t('Voir la réutilisation')"
  >
    <p class="m-0 text-xs truncate">
      {{ notification.details.reuse.title }}
    </p>
    <p class="m-0 text-xs text-gray-medium truncate">
      {{ $t('sur') }} {{ notification.details.dataset.title }}
    </p>
  </NotificationLayout>
</template>

<script setup lang="ts">
import { RiLineChartLine } from '@remixicon/vue'
import type { ReuseCreatedNotification } from '~/types/notifications'
import NotificationLayout from './NotificationLayout.vue'

defineProps<{
  notification: ReuseCreatedNotification
}>()
</script>
