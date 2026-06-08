<template>
  <NotificationLayout
    :icon="notification.details.kind === 'invitation' ? RiMailSendLine : RiUserAddLine"
    :title="notification.details.kind === 'invitation' ? $t('Invitation à rejoindre une organisation') : $t('Demande d\'adhésion')"
    :notification="notification"
    :title-link="notification.details.kind === 'invitation' ? '/admin/me/profile' : `/admin/organizations/${notification.details.request_organization.id}/members`"
    :title-link-title="$t('Voir la demande')"
  >
    <p class="m-0 text-xs">
      {{ notification.details.kind === 'invitation' ? $t('pour') : $t('de') }}
      <AvatarWithName
        :user="notification.details.request_user"
        :with-link="false"
      />
    </p>
    <p class="flex items-center gap-1 m-0 text-xs">
      {{ $t('à') }}
      <OrganizationOwner
        :organization="notification.details.request_organization as OrganizationReference"
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
import { AvatarWithName } from '@datagouv/components-next'
import type { OrganizationReference } from '@datagouv/components-next'
import { RiMailSendLine, RiUserAddLine } from '@remixicon/vue'
import type { MembershipRequestNotification } from '~/types/notifications'
import NotificationLayout from './NotificationLayout.vue'

defineProps<{
  notification: MembershipRequestNotification
}>()
</script>
