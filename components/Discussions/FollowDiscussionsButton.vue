<template>
  <BrandedButton
    color="secondary"
    size="xs"
    :icon="followed ? RiNotificationOffLine : RiNotification3Line"
    :loading="loading || resolved === null"
    @click="toggle"
  >
    {{ followed ? t('Ne plus suivre les discussions') : t('Suivre les discussions') }}
  </BrandedButton>
</template>

<script setup lang="ts">
import { BrandedButton, toast } from '@datagouv/components-next'
import { RiNotification3Line, RiNotificationOffLine } from '@remixicon/vue'
import type { NotificationResolved, NotificationScope } from '~/types/notifications'

const props = defineProps<{
  scope: NotificationScope
}>()

const { t } = useTranslation()
const { $api } = useNuxtApp()
const { load, ruleValue, setRule } = useNotificationSettings()

// Following the discussions of a subject only reports the new ones: their answers come
// from taking part in a thread, or following it.
const rule = computed(() => ({ scope: props.scope, event: 'NewDiscussion' as const }))

// The real state, rules and defaults applied: an owner or an administrator already
// hears about new discussions without having followed anything.
const resolved = ref<NotificationResolved | null>(null)
const followed = computed(() => (resolved.value?.channels.length ?? 0) > 0)

async function refresh() {
  resolved.value = await $api<NotificationResolved>('/api/1/notifications/resolved/', {
    query: { scope: `${props.scope.class}:${props.scope.id}`, event: 'NewDiscussion' },
  })
}

onMounted(() => Promise.all([load(), refresh()]))

const loading = ref(false)

async function toggle() {
  loading.value = true
  try {
    if (!followed.value) {
      await setRule(rule.value, true)
      toast.success(t('Vous serez prévenu des nouvelles discussions'))
    }
    else {
      // Withdraw one's own follow first: if nothing else brings the discussions, that
      // is enough, and the defaults of the user's role stay untouched.
      if (ruleValue(rule.value)) {
        await setRule(rule.value, null)
        await refresh()
      }
      // Still reached through a role or a follow of the whole subject: saying no here
      // is what the user asks for.
      if (followed.value) {
        await setRule(rule.value, false)
      }
      toast.success(t('Vous ne serez plus prévenu des nouvelles discussions'))
    }
    await refresh()
  }
  finally {
    loading.value = false
  }
}
</script>
