<template>
  <div class="p-3 flex gap-3 relative hover:bg-gray-some">
    <div class="flex-none">
      <RiSendPlaneLine class="size-4" />
    </div>
    <div class="flex-1">
      <p class="m-0 text-xs font-bold">
        <NuxtLink
          class="after:absolute after:inset-0 bg-none"
          :to="link"
        >
          {{ $t(`Demande de transfert`) }}
        </NuxtLink>
      </p>
      <p class="flex items-center gap-1 m-0 text-xs">
        {{ $t('de') }}
        <AvatarWithName
          v-if="notification.details.transfer_owner.class == 'User'"
          :user="notification.details.transfer_owner"
          :with-link="false"
        />
        <OrganizationOwner
          v-else
          :organization="notification.details.transfer_owner as OrganizationReference"
          logo-size-class="size-3"
          :logo-no-border="true"
          name-size="xs"
          name-color="text-gray-plain"
          :with-link="false"
        />
      </p>
      <p class="flex items-center gap-1 m-0 text-xs">
        {{ $t('à') }}
        <AvatarWithName
          v-if="notification.details.transfer_recipient.class == 'User'"
          :user="notification.details.transfer_recipient"
          :with-link="false"
        />
        <OrganizationOwner
          v-else
          :organization="notification.details.transfer_recipient as OrganizationReference"
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
import { useFormatDate } from '@datagouv/components-next'
import { RiSendPlaneLine } from '@remixicon/vue'
import type { DeepReadonly } from 'vue'
import type { TransferRequestNotification } from '~/types/notifications'

const props = defineProps<{
  notification: DeepReadonly<TransferRequestNotification>
}>()

const user = useMe()

const link = computed(() => {
  const recipient = props.notification.details.transfer_recipient
  const subject = props.notification.details.transfer_subject
  const subjectPath = `${subject.class.toLowerCase()}s`
  if (recipient.class == 'User') {
    return user.value.id === recipient.id ? `/admin/me/${subjectPath}` : `/admin/users/${recipient.id}/${subjectPath}`
  }
  return `/admin/organizations/${recipient.id}/${subjectPath}`
})

const { formatDate } = useFormatDate()
</script>
