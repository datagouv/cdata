<template>
  <NotificationLayout
    :icon="RiCloseCircleLine"
    :title="$t('Votre adhésion a été refusée')"
    :notification="notification"
    :requires-action="false"
  >
    <p class="m-0 text-xs flex items-center gap-1 truncate">
      {{ $t('pour rejoindre') }}
      <OrganizationOwner
        :organization="notification.details.organization as OrganizationReference"
        logo-size-class="size-3"
        :logo-no-border="true"
        name-size="xs"
        name-color="text-gray-plain"
        :with-link="false"
      />
    </p>
  </NotificationLayout>
</template>

<script setup lang="ts">
import { RiCloseCircleLine } from '@remixicon/vue'
import type { OrganizationReference } from '@datagouv/components-next'
import type { MembershipRefusedNotification } from '~/types/notifications'
import NotificationLayout from './NotificationLayout.vue'

defineProps<{
  notification: MembershipRefusedNotification
}>()
</script>
