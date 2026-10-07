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
const { load, decisionFor, decide } = useNotificationSettings()

onMounted(load)

// A follow of the whole subject, as editing it creates, covers its discussions too.
const followed = computed(() => decisionFor(props.scope, 'DiscussionEvent') ?? decisionFor(props.scope, 'ConfigurableEvent') ?? false)

const loading = ref(false)

async function toggle() {
  loading.value = true
  try {
    const follow = !followed.value
    await decide(props.scope, 'DiscussionEvent', follow)
    toast.success(follow ? t('Vous serez prévenu des nouvelles discussions et réponses') : t('Vous ne suivez plus ces discussions'))
  }
  finally {
    loading.value = false
  }
}
</script>
