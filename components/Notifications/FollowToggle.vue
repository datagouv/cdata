<template>
  <BrandedButton
    v-if="!failed"
    color="secondary"
    size="xs"
    :class="{ 'animate-pulse': resolved === null }"
    :icon="followed ? RiNotificationOffLine : RiNotification3Line"
    :icon-only="iconOnly"
    :title="label"
    :disabled="resolved === null"
    :loading
    @click="toggle"
  >
    <template v-if="!iconOnly">
      {{ label }}
    </template>
  </BrandedButton>
</template>

<script setup lang="ts">
import { BrandedButton, toast } from '@datagouv/components-next'
import { RiNotification3Line, RiNotificationOffLine } from '@remixicon/vue'
import type { NotificationEvent, NotificationResolved, NotificationScope } from '~/types/notifications'

// Follows or stops following some notifications on a subject, showing what the user
// really receives: an owner or an administrator hears about things without having
// followed anything, and the button says so.
const props = withDefaults(defineProps<{
  scope: NotificationScope
  event: NotificationEvent
  followLabel: string
  unfollowLabel: string
  // What the toast says once done.
  followedMessage: string
  unfollowedMessage: string
  iconOnly?: boolean
}>(), {
  iconOnly: false,
})

const { resolveFollow, follow } = useNotificationSettings()

const resolved = ref<NotificationResolved | null>(null)
// The answer could not be read (the API is down): the button would only mislead.
const failed = ref(false)
const followed = computed(() => resolved.value?.heard ?? false)
const label = computed(() => followed.value ? props.unfollowLabel : props.followLabel)

onMounted(async () => {
  try {
    resolved.value = await resolveFollow(props.scope, props.event)
  }
  catch {
    failed.value = true
  }
})

const loading = ref(false)

async function toggle() {
  loading.value = true
  try {
    resolved.value = await follow(props.scope, props.event, !followed.value)
    toast.success(followed.value ? props.followedMessage : props.unfollowedMessage)
  }
  finally {
    loading.value = false
  }
}
</script>
