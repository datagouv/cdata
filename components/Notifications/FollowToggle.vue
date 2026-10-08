<template>
  <BrandedButton
    v-if="current !== 'failed'"
    color="secondary"
    size="xs"
    :class="{ 'animate-pulse-placeholder': current === null }"
    :icon="followed ? RiNotificationOffLine : RiNotification3Line"
    :icon-only="iconOnly"
    :title="label"
    :disabled="current === null"
    :loading
    @click="toggle"
  >
    {{ label }}
  </BrandedButton>
</template>

<script setup lang="ts">
import { BrandedButton, toast } from '@datagouv/components-next'
import { RiNotification3Line, RiNotificationOffLine } from '@remixicon/vue'
import type { FollowState, NotificationEvent, NotificationScope } from '~/types/notifications'

// Follows or stops following some notifications on a subject, showing what the user
// really receives: an owner or an administrator hears about things without having
// followed anything, and the button says so. What it receives is read by the list it
// belongs to, for all of its subjects at once.
const props = withDefaults(defineProps<{
  scope: NotificationScope
  event: NotificationEvent
  state: FollowState
  followLabel: string
  unfollowLabel: string
  // What the toast says once done.
  followedMessage: string
  unfollowedMessage: string
  iconOnly?: boolean
}>(), {
  iconOnly: false,
})

const { follow } = useNotificationSettings()

// The answer to the last click, until the list reads them all again.
const current = ref<FollowState>(props.state)
watch(() => props.state, (state) => {
  current.value = state
})
const followed = computed(() => current.value !== null && current.value !== 'failed' && current.value.heard)
const label = computed(() => followed.value ? props.unfollowLabel : props.followLabel)

const loading = ref(false)

async function toggle() {
  loading.value = true
  try {
    current.value = await follow(props.scope, props.event, !followed.value)
    toast.success(followed.value ? props.followedMessage : props.unfollowedMessage)
  }
  finally {
    loading.value = false
  }
}
</script>
