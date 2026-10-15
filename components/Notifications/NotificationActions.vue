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
      class="z-[900] w-72 overflow-hidden rounded bg-white shadow-lg ring-1 ring-black/5"
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
        :disabled="pending"
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
import { throwOnNever, toast } from '@datagouv/components-next'
import { autoUpdate, flip, shift, useFloating } from '@floating-ui/vue'
import { RiMoreLine, RiSettings3Line } from '@remixicon/vue'
import { onClickOutside, useEventListener } from '@vueuse/core'
import CdataLink from '../CdataLink.vue'
import type { NotificationRuleKey, NotificationScope, UserNotification } from '~/types/notifications'
import { getSubjectDemonstrative } from '~/utils/discussions'

// The rule an action writes, and the title of what it names when known, for the toast.
type Action = { label: string, key: NotificationRuleKey, title?: string }

const props = defineProps<{
  notification: UserNotification
}>()

const { t } = useTranslation()
const { mute } = useNotificationSettings()

const { reasonsPhrase, eventLabel, mutedMessage } = useNotificationLabels()
// Badges and answers to membership requests are about the organization itself.
const reasons = computed(() => reasonsPhrase(props.notification.reasons, props.notification.type.startsWith('organization.')))

function ignoreSubject(scope: NotificationScope, title?: string): Action {
  return {
    label: t('Ne rien recevoir sur {subject}', { subject: getSubjectDemonstrative(t, scope.class) }),
    key: { scope, event: null },
    title,
  }
}

// The subject-level ways out, for the notifications whose subject is known: what they
// carry, not their type, tells which.
function subjectActions(notification: UserNotification): Array<Action> {
  const details = notification.details
  switch (details.class) {
    case 'DiscussionNotificationDetails':
      return [
        {
          label: t('Ne plus suivre cette discussion'),
          key: { scope: { class: 'Discussion', id: details.discussion.id }, event: 'discussion' },
          title: details.discussion.title,
        },
        ignoreSubject(details.discussion.subject),
      ]
    case 'ReuseCreatedNotificationDetails':
    case 'DataserviceCreatedNotificationDetails':
      return [ignoreSubject({ class: 'Dataset', id: details.dataset.id }, details.dataset.title)]
    case 'NewBadgeNotificationDetails':
    case 'MembershipAcceptedNotificationDetails':
    case 'MembershipRefusedNotificationDetails':
      return [ignoreSubject({ class: 'Organization', id: details.organization.id }, details.organization.name)]
    // Nothing a rule can be scoped to: a request to answer, which no rule applies to, or
    // a harvest source.
    case 'MembershipRequestNotificationDetails':
    case 'TransferRequestNotificationDetails':
    case 'ValidateHarvesterNotificationDetails':
      return []
    default:
      return throwOnNever(details, `Unknown notification ${notification.type}`)
  }
}

// The five badge types read as one, "Badges de l'organisation": turning them off turns
// them all off, or the next badge of another kind would come anyway.
const kind = computed(() => props.notification.type.startsWith('organization.badge.') ? 'organization.badge' : props.notification.type)

// Every action says "no": on this subject when it is known, and on this kind of
// notification anywhere.
const actions = computed<Array<Action>>(() => [
  ...subjectActions(props.notification),
  {
    label: t('Ne plus recevoir : {type}', { type: eventLabel(kind.value) }),
    key: { scope: null, event: kind.value },
  },
])

const pending = ref(false)

async function apply(action: Action) {
  pending.value = true
  try {
    await mute(action.key)
    toast.success(mutedMessage(action.key, action.title))
    open.value = false
  }
  finally {
    pending.value = false
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
