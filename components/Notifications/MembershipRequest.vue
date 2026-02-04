<template>
  <div class="p-3 flex gap-3 relative hover:bg-gray-some">
    <div class="flex-none">
      <RiMailSendLine
        v-if="notification.details.kind === 'invitation'"
        class="size-4"
      />
      <RiUserAddLine
        v-else
        class="size-4"
      />
    </div>
    <div class="flex-1 truncate">
      <p class="m-0 text-xs font-bold">
        <NuxtLink
          class="after:absolute after:inset-0 bg-none"
          :to="`/admin/organizations/${notification.details.request_organization.id}/members`"
        >
          {{ notification.details.kind === 'invitation' ? $t('Invitation à rejoindre une organisation') : $t(`Demande d'adhésion`) }}
        </NuxtLink>
      </p>
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
    </div>
    <div class="flex-none flex m-0 gap-1.5">
      <p class="m-0 text-xs">
        {{ formatDate(notification.created_at) }}
      </p>
      <div
        v-if="!notification.handled_at"
        class="size-2 rounded-full bg-danger mt-0.5"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AvatarWithName, useFormatDate, type OrganizationReference } from '@datagouv/components-next'
import { RiMailSendLine, RiUserAddLine } from '@remixicon/vue'
import type { DeepReadonly } from 'vue'
import type { MembershipRequestNotification } from '~/types/notifications'

defineProps<{
  notification: DeepReadonly<MembershipRequestNotification>
}>()

const { formatDate } = useFormatDate()
</script>
