<template>
  <BannerAction
    v-if="key"
    type="primary"
    :title="question"
  >
    <template #button>
      <BrandedButton
        v-if="nothingToStop"
        color="tertiary"
        size="xs"
        @click="dismiss"
      >
        {{ t('Fermer') }}
      </BrandedButton>
      <div
        v-else
        class="flex gap-2"
      >
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
import type { NotificationResolved, NotificationRuleKey, NotificationScope } from '~/types/notifications'
import { getSubjectDemonstrative } from '~/utils/discussions'

// The ways out a mail offers land here rather than acting on their own: a mail scanner
// opening the link must not unsubscribe anyone. The query is the key of the rule to
// write, the same as the menu of the notification in the bell writes.

const { t } = useTranslation()
const route = useRoute()
const router = useRouter()
const { mute, resolveFollow } = useNotificationSettings()
const { eventLabel, knownEvent } = useNotificationLabels()

// What the link asks to stop, before udata says whether it names anything. A type is
// checked here, as no call is made for it alone; a subject is udata's to recognize.
const asked = computed<NotificationRuleKey | null>(() => {
  const scope = typeof route.query.scope === 'string' ? route.query.scope : null
  const name = typeof route.query.event === 'string' ? route.query.event : null
  const event = name === null ? null : knownEvent(name)
  if (name !== null && event === null) return null
  if (!scope) return event ? { scope: null, event } : null
  const [className, id] = scope.split(':')
  if (!className || !id) return null
  return { scope: { class: className as NotificationScope['class'], id }, event }
})

// The subject is read back from udata rather than from the link, which must not be able
// to make the page say anything: an unknown or forged one gets no banner. Asked with the
// scope as a query value, never in a path.
const resolved = ref<NotificationResolved | null>(null)
watch(asked, async (asked) => {
  resolved.value = null
  if (!asked?.scope) return
  try {
    resolved.value = await resolveFollow(asked.scope, asked.event)
  }
  catch {
    // Unknown to udata: nothing to confirm.
  }
}, { immediate: true })

const key = computed<NotificationRuleKey | null>(() => asked.value?.scope ? (resolved.value && asked.value) : asked.value)

// Its title when the user may still see it, "ce jeu de données" otherwise.
const subjectName = computed(() => {
  const scope = key.value?.scope
  if (!scope) return ''
  const title = resolved.value?.subject?.title
  return title ? `« ${title} »` : getSubjectDemonstrative(t, scope.class)
})

// Nothing left to stop: the link was confirmed before, or nothing brings these
// notifications any more.
const nothingToStop = computed(() => resolved.value !== null && !resolved.value.heard)

const question = computed(() => {
  const scope = key.value?.scope
  if (scope?.class === 'Discussion') {
    if (nothingToStop.value) return t('Vous ne suivez déjà plus cette discussion.')
    return resolved.value?.subject ? t('Ne plus suivre la discussion {subject} ?', { subject: subjectName.value }) : t('Ne plus suivre cette discussion ?')
  }
  if (scope) {
    if (nothingToStop.value) return t('Vous ne recevez déjà rien sur {subject}.', { subject: subjectName.value })
    return t('Ne plus rien recevoir sur {subject} ?', { subject: subjectName.value })
  }
  return t('Ne plus recevoir : {type} ?', { type: eventLabel(key.value!.event!) })
})

const done = computed(() => {
  const scope = key.value?.scope
  if (scope?.class === 'Discussion') return t('Vous ne suivez plus cette discussion')
  if (scope) return t('Vous ne recevrez plus de notifications sur {subject}', { subject: getSubjectDemonstrative(t, scope.class) })
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
