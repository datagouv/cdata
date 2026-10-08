<template>
  <section :aria-labelledby="titleId">
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
    <div
      v-if="!resolved"
      class="animate-pulse-placeholder space-y-3"
    >
      <div class="bg-gray-200 h-3 w-full" />
      <div class="bg-gray-200 h-6 w-1/3" />
    </div>
    <template v-else>
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
    </template>
  </section>
</template>

<script setup lang="ts">
import { BrandedButton, throwOnNever, toast } from '@datagouv/components-next'
import { RiNotification3Line, RiNotificationOffLine } from '@remixicon/vue'
import type { Component } from 'vue'
import CdataLink from '../CdataLink.vue'
import type { NotificationResolved, NotificationScope } from '~/types/notifications'

// Whether the user hears about a subject, why, and the one thing to do about it, as
// udata resolves it.
const props = defineProps<{
  scope: NotificationScope
  // "ce jeu de données", "cette réutilisation"…
  subject: string
}>()

type Action = { label: string, icon: Component, done: string, run: () => Promise<unknown> }

const { t } = useTranslation()
const { setRule, resolveFollow, follow, paused } = useNotificationSettings()
const { reasonsPhrase, eventLabel } = useNotificationLabels()

const titleId = useId()
const resolved = ref<NotificationResolved | null>(null)
const loading = ref(false)

async function refresh() {
  resolved.value = await resolveFollow(props.scope, null)
}

onMounted(refresh)

// Following some of its notifications only reads as not hearing about the subject as a
// whole: it comes before "muted", which such a follow overrides.
const state = computed<'paused' | 'heard' | 'restricted' | 'muted' | 'none'>(() => {
  if (paused.value) return 'paused'
  if (resolved.value?.heard) return 'heard'
  if (resolved.value?.followed_events.length) return 'restricted'
  if (resolved.value?.muted) return 'muted'
  return 'none'
})

const sentence = computed(() => {
  switch (state.value) {
    case 'paused':
      return t('Toutes vos notifications sont désactivées.')
    case 'heard':
      return t('Vous recevez les notifications de {subject}, {reasons}.', {
        subject: props.subject,
        reasons: reasonsPhrase(resolved.value!.reasons),
      })
    case 'restricted':
      return t('Vous recevez seulement : {events}.', { events: humanJoin(resolved.value!.followed_events.map(eventLabel)) })
    case 'muted':
      return t('Vous avez coupé les notifications de {subject}.', { subject: props.subject })
    case 'none':
      return t('Vous ne recevez pas les notifications de {subject}.', { subject: props.subject })
    default:
      return throwOnNever(state.value, `Unknown state ${state.value}`)
  }
})

const action = computed<Action | null>(() => {
  switch (state.value) {
    // Nothing to do here: "turn everything off" is undone on the settings page.
    case 'paused':
      return null
    case 'heard':
    case 'restricted':
      return {
        label: t('Ne plus recevoir'),
        icon: RiNotificationOffLine,
        done: t('Vous ne recevrez plus de notifications sur {subject}', { subject: props.subject }),
        run: async () => {
          resolved.value = await follow(props.scope, null, false)
        },
      }
    case 'muted':
      return {
        label: t('Réactiver'),
        icon: RiNotification3Line,
        done: t('Notifications réactivées'),
        run: async () => {
          await setRule({ scope: props.scope, event: null }, null)
          await refresh()
        },
      }
    case 'none':
      return {
        label: t('Suivre'),
        icon: RiNotification3Line,
        done: t('Vous suivez {subject}', { subject: props.subject }),
        run: async () => {
          resolved.value = await follow(props.scope, null, true)
        },
      }
    default:
      return throwOnNever(state.value, `Unknown state ${state.value}`)
  }
})

async function run(action: Action) {
  loading.value = true
  try {
    await action.run()
    toast.success(action.done)
  }
  finally {
    loading.value = false
  }
}
</script>
