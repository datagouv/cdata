import type { NotificationEvent, NotificationResolved, NotificationRuleKey, NotificationScope } from '~/types/notifications'

// The follow buttons of a page asking within the same tick, by event: one call answers
// all of their subjects.
const pendingFollows = new Map<NotificationEvent | null, { scopes: Array<NotificationScope>, answer: Promise<Array<NotificationResolved>> }>()

// What a user can ask about their notifications. Which rules that writes, and how they
// rank, is udata's to know: the front asks and shows the answer.
export function useNotificationSettings() {
  const { $api } = useNuxtApp()

  // `null` removes the rule, so the broader rules or the defaults apply again.
  async function setRule(key: NotificationRuleKey, enabled: boolean | null) {
    await $api('/api/1/notifications/settings/', {
      method: 'PUT',
      body: { ...key, enabled },
    })
  }

  // What the user gets for some notifications on a subject (all of them without an
  // event), batched with the other subjects asked about in the same tick.
  async function resolveFollow(scope: NotificationScope, event: NotificationEvent | null): Promise<NotificationResolved> {
    let batch = pendingFollows.get(event)
    if (!batch) {
      const scopes: Array<NotificationScope> = []
      const answer = Promise.resolve().then(() => {
        pendingFollows.delete(event)
        return $api<Array<NotificationResolved>>('/api/1/notifications/resolved/', {
          query: {
            scope: scopes.map(scope => `${scope.class}:${scope.id}`),
            event: event ?? undefined,
          },
        })
      })
      batch = { scopes, answer }
      pendingFollows.set(event, batch)
    }
    batch.scopes.push(scope)
    const answers = await batch.answer
    return answers.find(answer => answer.scope.class === scope.class && answer.scope.id === scope.id)!
  }

  // Follow some notifications on a subject (all of them without an event), or stop,
  // and get what the user hears about once done.
  function follow(scope: NotificationScope, event: NotificationEvent | null, followed: boolean) {
    return $api<NotificationResolved>('/api/1/notifications/follow/', {
      method: 'PUT',
      body: { scope, event, followed },
    })
  }

  // What every "stop" does, in the bell as in the mails, for the rule key it names: a
  // thread or a subject stops being followed, a type is turned off anywhere.
  async function mute(key: NotificationRuleKey) {
    if (key.scope) await follow(key.scope, key.event, false)
    else await setRule(key, false)
  }

  // "Turn everything off" is a field of the user rather than a rule: no rule, however
  // precise, can bring anything back.
  const me = useMaybeMe()
  const paused = computed(() => me.value?.notifications_paused ?? false)

  return { setRule, resolveFollow, follow, mute, paused }
}
