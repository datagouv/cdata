<template>
  <div class="p-3 flex gap-3 relative hover:bg-gray-some">
    <div class="flex-none">
      <RiUserAddLine class="size-4" />
    </div>
    <div class="flex-1">
      <p class="m-0 text-xs font-bold">
        <NuxtLink
          class="after:absolute after:inset-0 bg-none"
          :to="`/admin/organizations/${notification.details.request_organization.id}/members`"
        >
          {{ $t(`Demande d'adhésion`) }}
        </NuxtLink>
      </p>
      <p class="m-0 text-xs">
        {{ $t('de {name}', { name: `${notification.details.request_user.first_name} ${notification.details.request_user.last_name}` }) }}
      </p>
      <p class="m-0 text-xs">
        {{ $t('à {org}', { org: notification.details.request_organization.name }) }}
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
import { useFormatDate } from '@datagouv/components-next'
import { RiUserAddLine } from '@remixicon/vue'
import type { DeepReadonly } from 'vue'
import type { MembershipRequestNotification } from '~/types/notifications'

defineProps<{
  notification: DeepReadonly<MembershipRequestNotification>
}>()

const { formatDate } = useFormatDate()
</script>
