<template>
  <section
    v-if="resolved"
    :aria-labelledby="titleId"
  >
    <h2
      :id="titleId"
      class="m-0 mb-3 flex items-center gap-1 text-sm font-bold"
    >
      <RiNotification3Line
        class="size-4"
        aria-hidden="true"
      />
      {{ t('Notifications') }}
    </h2>
    <p class="m-0 mb-3 text-xs">
      {{ sentence }}
    </p>
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <BrandedButton
        v-if="action"
        color="secondary"
        size="xs"
        :icon="action.icon"
        :loading
        @click="run(action)"
      >
        {{ action.label }}
      </BrandedButton>
      <CdataLink
        to="/admin/me/notifications"
        class="link text-xs"
      >
        {{ t('Gérer mes notifications') }}
      </CdataLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { BrandedButton, toast } from '@datagouv/components-next'
import { RiNotification3Line, RiNotificationOffLine } from '@remixicon/vue'
import type { Component } from 'vue'
import CdataLink from '../CdataLink.vue'
import type { NotificationResolved, NotificationScope } from '~/types/notifications'

// Whether the user hears about a subject, why, and the one thing to do about it, as
// udata resolves it: the box never guesses from the rules.
const props = defineProps<{
  scope: NotificationScope
  // "ce jeu de données", "cette réutilisation"…
  subject: string
}>()

type Action = { label: string, icon: Component, done: string, run: () => Promise<unknown> }

const { t } = useTranslation()
const { load, ruleValue, narrowerRules, setRule, resolveFollow, follow, paused } = useNotificationSettings()
const { reasonsPhrase, eventLabel } = useNotificationLabels()

const titleId = useId()
const resolved = ref<NotificationResolved | null>(null)
const loading = ref(false)

async function refresh() {
  resolved.value = await resolveFollow(props.scope, null)
}

onMounted(async () => {
  await Promise.all([load(), refresh()])
})

// Follows restricted to some notifications of the subject: the resolution above is about
// all of them, and would otherwise say nothing reaches the user.
const restricted = computed(() => narrowerRules(props.scope).filter(rule => rule.enabled))
const muted = computed(() => ruleValue({ scope: props.scope }) === false)

const sentence = computed(() => {
  if (paused.value) return t('Toutes vos notifications sont désactivées.')
  if (resolved.value?.heard) {
    return t('Vous recevez les notifications de {subject}, {reasons}.', {
      subject: props.subject,
      reasons: reasonsPhrase(resolved.value?.reasons ?? []),
    })
  }
  if (muted.value) return t('Vous avez coupé les notifications de {subject}.', { subject: props.subject })
  if (restricted.value.length) {
    return t('Vous recevez seulement : {events}.', { events: humanJoin(restricted.value.map(rule => eventLabel(rule.event!))) })
  }
  return t('Vous ne recevez pas les notifications de {subject}.', { subject: props.subject })
})

const action = computed<Action | null>(() => {
  // Nothing to do here: "turn everything off" is undone on the settings page.
  if (paused.value) return null
  if (resolved.value?.heard || restricted.value.length) {
    return {
      label: t('Ne plus recevoir'),
      icon: RiNotificationOffLine,
      done: t('Vous ne recevrez plus de notifications sur {subject}', { subject: props.subject }),
      run: () => follow(props.scope, null, false),
    }
  }
  if (muted.value) {
    return {
      label: t('Réactiver'),
      icon: RiNotification3Line,
      done: t('Notifications réactivées'),
      run: () => setRule({ scope: props.scope }, null),
    }
  }
  return {
    label: t('Suivre'),
    icon: RiNotification3Line,
    done: t('Vous suivez {subject}', { subject: props.subject }),
    run: () => follow(props.scope, null, true),
  }
})

async function run(action: Action) {
  loading.value = true
  try {
    await action.run()
    await refresh()
    toast.success(action.done)
  }
  finally {
    loading.value = false
  }
}
</script>
