<template>
  <div class="p-3 flex gap-3 relative hover:bg-gray-some">
    <div class="flex-none">
      <RiSendPlaneLine class="size-4" />
    </div>
    <div class="flex-1">
      <p class="m-0 text-xs font-bold">
        <NuxtLink
          class="after:absolute after:inset-0 bg-none"
          :to="details.link"
        >
          {{ $t(`Demande de transfert`) }}
        </NuxtLink>
      </p>
      <p class="m-0 text-xs">
        {{ $t('de {source}', { source: details.sourceName }) }}
      </p>
      <p class="m-0 text-xs">
        {{ $t('à {recipient}', { recipient: details.recipientName }) }}
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
import { RiSendPlaneLine } from '@remixicon/vue'
import type { DeepReadonly } from 'vue'
import type { TransferRequestNotification } from '~/types/notifications'

const props = defineProps<{
  notification: DeepReadonly<TransferRequestNotification>
}>()

const user = useMe()

const details = computed(() => {
  const recipient = props.notification.details.transfer_recipient
  const source = props.notification.details.transfer_owner
  const sourceName = 'first_name' in source ? `${source.first_name} ${source.last_name}` : source.name
  const subject = props.notification.details.transfer_subject
  const subjectPath = `${subject.class.toLowerCase()}s`
  if ('first_name' in recipient) {
    return {
      link: user.value.id === recipient.id ? `/admin/me/${subjectPath}` : `/admin/users/${recipient.id}/${subjectPath}`,
      recipientName: `${recipient.first_name} ${recipient.last_name}`,
      sourceName,
    }
  }
  return {
    link: `/admin/organizations/${recipient.id}/${subjectPath}`,
    recipientName: recipient.name,
    sourceName,
  }
})

const { formatDate } = useFormatDate()
</script>
