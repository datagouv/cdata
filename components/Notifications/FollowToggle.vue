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
const { $api } = useNuxtApp()
const { load, ruleValue, setRule } = useNotificationSettings()

const rule = computed(() => ({ scope: props.scope, event: props.event }))

const resolved = ref<NotificationResolved | null>(null)
const followed = computed(() => (resolved.value?.channels.length ?? 0) > 0)
const label = computed(() => followed.value ? props.unfollowLabel : props.followLabel)

async function refresh() {
  resolved.value = await $api<NotificationResolved>('/api/1/notifications/resolved/', {
    query: { scope: `${props.scope.class}:${props.scope.id}`, event: props.event },
  })
}

onMounted(() => Promise.all([load(), refresh()]))

const loading = ref(false)

async function toggle() {
  loading.value = true
  try {
    if (!followed.value) {
      await setRule(rule.value, true)
    }
    else {
      // Withdraw one's own follow first: if nothing else brings these notifications,
      // that is enough, and the defaults of the user's role stay untouched.
      if (ruleValue(rule.value)) {
        await setRule(rule.value, null)
        await refresh()
      }
      // Still reached through a role or a broader follow: saying no here is what the
      // user asks for.
      if (followed.value) {
        await setRule(rule.value, false)
      }
    }
    await refresh()
    toast.success(followed.value ? t('Vous serez prévenu') : t('Vous ne serez plus prévenu'))
  }
  finally {
    loading.value = false
  }
}
</script>
