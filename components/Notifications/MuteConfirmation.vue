<template>
  <BannerAction
    v-if="key"
    type="primary"
    :title="question"
  >
    <template #button>
      <div class="flex gap-2">
        <BrandedButton
          color="tertiary"
          size="xs"
          @click="dismiss"
        >
          {{ t('Annuler') }}
        </BrandedButton>
        <BrandedButton
          color="primary"
          size="xs"
          :loading="saving"
          @click="confirm"
        >
          {{ t('Confirmer') }}
        </BrandedButton>
      </div>
    </template>
  </BannerAction>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton, toast } from '@datagouv/components-next'
import type { NotificationRuleKey, NotificationScope } from '~/types/notifications'

// The ways out a mail offers land here rather than acting on their own: a mail scanner
// opening the link must not unsubscribe anyone. The query is the key of the rule to
// write, the same as the menu of the notification in the bell writes.

const { t } = useTranslation()
const { $api } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const { mute } = useNotificationSettings()
const { eventLabel, knownEvent } = useNotificationLabels()

// Topics only exist in the API v2.
const API_PATHS: Record<NotificationScope['class'], string> = {
  Organization: '/api/1/organizations/',
  Discussion: '/api/1/discussions/',
  Dataset: '/api/1/datasets/',
  Reuse: '/api/1/reuses/',
  Dataservice: '/api/1/dataservices/',
  Post: '/api/1/posts/',
  Topic: '/api/2/topics/',
}

// The links udata writes only hold object ids: anything else would end up in the path of
// an API call made with the user's session (`..` climbing to `/logout/`).
const OBJECT_ID = /^[0-9a-f]{24}$/

// Nothing of the link is shown, nor sent, unless it is something udata writes: a known
// type, and a known class with an object id.
const key = computed<NotificationRuleKey | null>(() => {
  const scope = typeof route.query.scope === 'string' ? route.query.scope : null
  const name = typeof route.query.event === 'string' ? route.query.event : null
  const event = name === null ? null : knownEvent(name)
  if (name !== null && event === null) return null
  if (!scope) return event ? { scope: null, event } : null
  const [className, id] = scope.split(':')
  if (!className || !Object.hasOwn(API_PATHS, className) || !id || !OBJECT_ID.test(id)) return null
  return { scope: { class: className as NotificationScope['class'], id }, event }
})

// Read back from the API rather than taken from the link: a link must not be able to
// make the page say anything.
const title = ref<string | null>(null)
watch(key, async (key) => {
  title.value = null
  if (!key?.scope) return
  try {
    const subject = await $api<{ title?: string, name?: string }>(`${API_PATHS[key.scope.class]}${key.scope.id}/`)
    title.value = subject.title ?? subject.name ?? null
  }
  catch {
    // Out of reach: the question stays generic.
  }
}, { immediate: true })

const question = computed(() => {
  const scope = key.value?.scope
  if (scope?.class === 'Discussion') {
    return title.value ? t('Ne plus suivre la discussion « {title} » ?', { title: title.value }) : t('Ne plus suivre cette discussion ?')
  }
  if (scope) {
    return title.value ? t('Ne plus rien recevoir sur « {title} » ?', { title: title.value }) : t('Ne plus rien recevoir sur ce contenu ?')
  }
  return t('Ne plus recevoir : {type} ?', { type: eventLabel(key.value!.event!) })
})

const done = computed(() => {
  const scope = key.value?.scope
  if (scope?.class === 'Discussion') return t('Vous ne suivez plus cette discussion')
  if (scope) return t('Vous ne recevrez plus de notifications sur ce contenu')
  return t('Vous ne recevrez plus ce type de notification')
})

function dismiss() {
  return router.replace({ query: {} })
}

const saving = ref(false)
async function confirm() {
  saving.value = true
  try {
    await mute(key.value!)
    toast.success(done.value)
    await dismiss()
  }
  finally {
    saving.value = false
  }
}
</script>
