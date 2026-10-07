<template>
  <div>
    <button
      ref="trigger"
      type="button"
      class="size-5 flex items-center justify-center rounded bg-none hover:bg-gray-lower opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
      :class="{ '!opacity-100 bg-gray-lower': open }"
      :title="t('Pourquoi je reçois ça ?')"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="open = !open"
    >
      <RiMoreLine
        class="size-4"
        aria-hidden="true"
      />
    </button>
    <!-- Not teleported: inside the notifications panel, clicking here keeps that one open.
         Fixed, so that the notification list, which scrolls, does not clip it. -->
    <div
      v-if="open"
      ref="panel"
      class="z-[900] w-72 overflow-hidden rounded border border-gray-default bg-white shadow-lg"
      :style="floatingStyles"
    >
      <p
        v-if="reasons"
        class="m-0 px-3 py-2 border-b border-gray-default bg-gray-some text-xs text-gray-medium"
      >
        {{ t('Vous recevez cette notification {reasons}.', { reasons }) }}
      </p>
      <button
        v-for="action in actions"
        :key="action.label"
        type="button"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm leading-tight text-gray-title hover:bg-gray-some disabled:opacity-50"
        :disabled="pending !== null"
        @click="apply(action)"
      >
        {{ action.label }}
      </button>
      <CdataLink
        to="/admin/me/notifications"
        class="flex w-full items-center gap-2 px-3 py-2 border-t border-gray-default text-sm leading-tight text-gray-title !bg-none !no-underline hover:!bg-gray-some"
        @click="open = false"
      >
        <RiSettings3Line
          class="size-4 shrink-0 text-gray-medium"
          aria-hidden="true"
        />
        {{ t('Gérer mes notifications') }}
      </CdataLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toast } from '@datagouv/components-next'
import { autoUpdate, flip, shift, useFloating } from '@floating-ui/vue'
import { RiMoreLine, RiSettings3Line } from '@remixicon/vue'
import { onClickOutside, useEventListener } from '@vueuse/core'
import CdataLink from '../CdataLink.vue'
import type { NotificationScope, UserNotification } from '~/types/notifications'

// `done` is what the toast says once `run` succeeded.
type Action = { label: string, done: string, run: () => Promise<unknown> }

const props = defineProps<{
  notification: UserNotification
}>()

const { t } = useTranslation()
const { setRule, follow, followSubject } = useNotificationSettings()

const { reasonsPhrase } = useNotificationLabels()
const reasons = computed(() => reasonsPhrase(props.notification.reasons))

const ignoreSubject = (label: string, done: string, scope: NotificationScope): Action => ({ label, done, run: () => followSubject(scope, false) })

// The subject-level ways out, for the notifications whose subject is known.
function subjectActions(notification: UserNotification): Array<Action> {
  switch (notification.type) {
    case 'discussion.new':
    case 'discussion.comment':
    case 'discussion.closed':
      return [
        {
          label: t('Ne plus suivre cette discussion'),
          done: t('Vous ne suivez plus cette discussion'),
          run: () => follow({ class: 'Discussion', id: notification.details.discussion.id }, 'discussion', false),
        },
        ignoreSubject(t('Ne rien recevoir sur ce contenu'), t('Vous ne recevrez plus de notifications sur ce contenu'), notification.details.discussion.subject),
      ]
    case 'reuse.created':
    case 'dataservice.created':
      return [
        ignoreSubject(t('Ne rien recevoir sur ce jeu de données'), t('Vous ne recevrez plus de notifications sur ce jeu de données'), { class: 'Dataset', id: notification.details.dataset.id }),
      ]
    case 'organization.badge.certified':
    case 'organization.badge.public-service':
    case 'organization.badge.company':
    case 'organization.badge.association':
    case 'organization.badge.local-authority':
    case 'organization.membership.accepted':
    case 'organization.membership.refused':
      return [
        ignoreSubject(t('Ne rien recevoir sur cette organisation'), t('Vous ne recevrez plus de notifications sur cette organisation'), { class: 'Organization', id: notification.details.organization.id }),
      ]
    default:
      return []
  }
}

// Every action says "no": on this subject when it is known, and on this kind of
// notification anywhere.
const actions = computed<Array<Action>>(() => [
  ...subjectActions(props.notification),
  {
    label: t('Ne plus recevoir ce type de notification'),
    done: t('Vous ne recevrez plus ce type de notification'),
    run: () => setRule({ event: props.notification.type }, false),
  },
])

const pending = ref<string | null>(null)

async function apply(action: Action) {
  pending.value = action.label
  try {
    await action.run()
    toast.success(action.done)
    open.value = false
  }
  finally {
    pending.value = null
  }
}

// A hand-made menu rather than headlessui's Popover: nested in the notifications
// panel, itself a teleported Popover, it took a second click on its own button for a
// click outside, closed on mousedown and reopened on click.
const open = ref(false)
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const panel = useTemplateRef<HTMLElement>('panel')
onClickOutside(panel, () => {
  open.value = false
}, { ignore: [trigger] })
// Captured before the notifications panel, which closes itself on Escape and stops it
// there: Escape closes this menu first, the panel on the next one.
useEventListener(document, 'keydown', (event: KeyboardEvent) => {
  if (event.key !== 'Escape' || !open.value) return
  event.stopPropagation()
  open.value = false
}, { capture: true })

const { floatingStyles } = useFloating(trigger, panel, {
  placement: 'bottom-end',
  strategy: 'fixed',
  middleware: [flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
})
</script>
