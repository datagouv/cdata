<template>
  <div class="p-3 flex gap-3 relative hover:bg-gray-some">
    <div class="flex-none">
      <RiUserAddLine class="size-4" />
    </div>
    <div class="flex-1">
      <p class="m-0 text-xs font-bold">
        <NuxtLink
          class="after:absolute after:inset-0 bg-none"
          :to="`/admin/organizations/${notification.details.organization}/members`"
        >
          {{ $t(`Demande d'adhésion`) }}
        </NuxtLink>
      </p>
      <p class="m-0 text-xs">
        {{ $t(`de ${notification.details.user.fullname}`) }}
      </p>
      <p class="m-0 text-xs">
        {{ $t(`à ${notification.details.organization}`) }}
      </p>
    </div>
    <div class="flex-none flex m-0 gap-1.5">
      <p class="m-0 text-xs">
        {{ formatDate(notification.created_on) }}
      </p>
      <div class="size-2 rounded-full bg-danger mt-0.5" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormatDate } from '@datagouv/components-next'
import { RiUserAddLine } from '@remixicon/vue'
import type { MembershipRequestNotification } from '~/types/notifications'

defineProps<{
  notification: MembershipRequestNotification
}>()

const { formatDate } = useFormatDate()
</script>
