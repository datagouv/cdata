<template>
  <div class="p-3 flex gap-3 relative hover:bg-gray-some">
    <div class="flex-none">
      <RiCheckboxCircleLine class="size-4" />
    </div>
    <div class="flex-1 truncate">
      <p class="m-0 text-xs font-bold">
        {{ $t('Votre adhésion a été acceptée') }}
      </p>
      <p class="m-0 text-xs flex items-center gap-1 truncate">
        {{ $t(`pour rejoindre`) }}
        <OrganizationOwner
          :organization="notification.details.organization as OrganizationReference"
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
      <AnimatedLoader
        v-if="loading"
        class="size-2"
      />
      <div
        v-else-if="!notification.handled_at"
        class="size-2 rounded-full bg-new-primary mt-0.5"
      />
    </div>
    <button
      v-if="!notification.handled_at"
      class="after:absolute after:inset-0 bg-none"
      :title="$t('Marquer la notification comme lue')"
      @click="markAsRead(notification)"
    />
  </div>
</template>

<script setup lang="ts">
import { useFormatDate, type OrganizationReference } from '@datagouv/components-next'
import { RiCheckboxCircleLine } from '@remixicon/vue'
import type { DeepReadonly } from 'vue'
import type { MembershipAcceptedNotification } from '~/types/notifications'

defineProps<{
  notification: DeepReadonly<MembershipAcceptedNotification>
}>()

const { formatDate } = useFormatDate()
const { loading, markAsRead } = useMarkAsRead()
</script>
