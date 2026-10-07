<template>
  <BrandedButton
    color="secondary"
    size="xs"
    :icon="followed ? RiNotificationOffLine : RiNotification3Line"
    :icon-only="iconOnly"
    :title="label"
    :loading="loading || resolved === null"
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
  iconOnly?: boolean
}>(), {
  iconOnly: false,
})

const { t } = useTranslation()
const { resolveFollow, follow } = useNotificationSettings()

const resolved = ref<NotificationResolved | null>(null)
const followed = computed(() => (resolved.value?.channels.length ?? 0) > 0)
const label = computed(() => followed.value ? props.unfollowLabel : props.followLabel)

onMounted(async () => {
  resolved.value = await resolveFollow(props.scope, props.event)
})

const loading = ref(false)

async function toggle() {
  loading.value = true
  try {
    resolved.value = await follow(props.scope, props.event, !followed.value)
    toast.success(followed.value ? t('Vous serez prévenu') : t('Vous ne serez plus prévenu'))
  }
  finally {
    loading.value = false
  }
}
</script>
