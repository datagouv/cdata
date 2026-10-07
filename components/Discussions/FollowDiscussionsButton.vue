<template>
  <BrandedButton
    color="secondary"
    size="xs"
    :icon="followed ? RiNotificationOffLine : RiNotification3Line"
    :loading
    @click="toggle"
  >
    {{ followed ? t('Ne plus suivre les discussions') : t('Suivre les discussions') }}
  </BrandedButton>
</template>

<script setup lang="ts">
import { BrandedButton, toast } from '@datagouv/components-next'
import { RiNotification3Line, RiNotificationOffLine } from '@remixicon/vue'
import type { NotificationScope } from '~/types/notifications'

const props = defineProps<{
  scope: NotificationScope
}>()

const { t } = useTranslation()
const { load, ruleValue, setRule } = useNotificationSettings()

onMounted(load)

// Following the discussions of a subject only reports the new ones: their answers come
// from taking part in a thread, or following it.
const followed = computed(() => ruleValue({ scope: props.scope, event: 'NewDiscussion' })
  ?? ruleValue({ scope: props.scope, event: 'DiscussionEvent' })
  ?? ruleValue({ scope: props.scope })
  ?? false)

const loading = ref(false)

async function toggle() {
  loading.value = true
  try {
    const follow = !followed.value
    await setRule({ scope: props.scope, event: 'NewDiscussion' }, follow)
    toast.success(follow ? t('Vous serez prévenu des nouvelles discussions') : t('Vous ne suivez plus les discussions'))
  }
  finally {
    loading.value = false
  }
}
</script>
