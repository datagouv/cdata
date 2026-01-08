<template>
  <div class="p-3 flex gap-3 relative hover:bg-gray-some">
    <div class="flex-none">
      <RiCheckboxCircleLine class="size-4" />
    </div>
    <div class="flex-1">
      <p class="m-0 text-xs font-bold">
        <NuxtLink
          class="after:absolute after:inset-0 bg-none"
          :to="notification.details.organization.page"
        >
          {{ $t(`Votre organisation a été certifiée`) }}
        </NuxtLink>
      </p>
      <OrganizationOwner
        :organization="notification.details.organization as OrganizationReference"
      />
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
import { RiCheckboxCircleLine } from '@remixicon/vue'
import type { DeepReadonly } from 'vue'
import { useFormatDate } from '@datagouv/components-next'
import type { OrganizationReference } from '@datagouv/components-next'
import type { CertifiedNotification } from '~/types/notifications'

defineProps<{
  notification: DeepReadonly<CertifiedNotification>
}>()

const { formatDate } = useFormatDate()
</script>
