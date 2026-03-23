<template>
  <div class="p-3 flex gap-3 relative hover:bg-gray-some">
    <div class="flex-none">
      <RiCheckboxCircleLine
        v-if="notification.details.status === 'accepted'"
        class="size-4"
      />
      <RiCloseCircleLine
        v-else-if="notification.details.status === 'refused'"
        class="size-4"
      />
      <RiLinkUnlink
        v-else
        class="size-4"
      />
    </div>
    <div class="flex-1 truncate">
      <p class="m-0 text-xs font-bold">
        <CdataLink
          class="after:absolute after:inset-0 bg-none"
          :to="`/admin/harvesters/${notification.details.source.id}`"
          @click="handleLinkClick"
        >
          {{ statusLabel }}
        </CdataLink>
      </p>
      <p class="m-0 text-xs">
        {{ notification.details.source.name }}
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
        class="size-2 rounded-full mt-0.5"
        :class="notification.details.status === 'pending' ? 'bg-danger' : 'bg-new-primary'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RiCheckboxCircleLine, RiCloseCircleLine, RiLinkUnlink } from '@remixicon/vue'
import { AnimatedLoader, throwOnNever, useFormatDate } from '@datagouv/components-next'
import type { ValidateHarvesterNotification } from '~/types/notifications'
import CdataLink from '../CdataLink.vue'

const props = defineProps<{
  notification: ValidateHarvesterNotification
}>()

const { formatDate } = useFormatDate()
const { t } = useTranslation()

const { loading, markAsRead } = useMarkAsRead()

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

const handleLinkClick = () => {
  if (props.notification.details.status !== 'pending') {
    markAsRead(props.notification)
  }
}
</script>
