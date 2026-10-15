import type { FollowState, NotificationEvent, NotificationResolved, NotificationRuleKey, NotificationScope } from '~/types/notifications'

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

  // What the user gets for some notifications on each subject (all of them without an
  // event), in one call for all of them. `quiet` leaves a failure to the caller, without
  // the error toast.
  function resolveFollows(scopes: Array<NotificationScope>, event: NotificationEvent | null, { quiet = false } = {}) {
    return $api<Array<NotificationResolved>>('/api/1/notifications/resolved/', {
      query: { scope: scopes.map(scope => `${scope.class}:${scope.id}`), event: event ?? undefined },
      ...(quiet ? { onResponseError: () => {} } : {}),
    })
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

  return { setRule, resolveFollows, follow, mute, paused }
}

// The follow buttons of a list of subjects, read in one call and again with the list:
// opening a discussion or answering in one makes the user follow it.
export function useFollowStates(scopes: MaybeRefOrGetter<Array<NotificationScope>>, event: NotificationEvent) {
  const { resolveFollows } = useNotificationSettings()
  const answers = ref<Array<NotificationResolved> | null>(null)
  const failed = ref(false)
  // Only the latest read counts: an earlier one answering last would bring back the
  // subjects of the page before.
  let latest = 0

  async function read() {
    const asked = toValue(scopes)
    if (!asked.length) return
    const current = ++latest
    try {
      const read = await resolveFollows(asked, event)
      if (current !== latest) return
      answers.value = read
      failed.value = false
    }
    catch {
      if (current === latest) failed.value = true
    }
  }

  function stateOf(scope: NotificationScope): FollowState {
    if (failed.value) return 'failed'
    return answers.value?.find(answer => answer.scope.class === scope.class && answer.scope.id === scope.id) ?? null
  }

  return { read, stateOf }
}
