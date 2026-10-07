import type { NotificationChannel, NotificationEvent, NotificationReason, NotificationResolved, NotificationRuleKey, NotificationScope, NotificationSetting } from '~/types/notifications'
import type { Me } from '~/utils/auth'

// Shared by every discussion of a page: they all read the same list, fetched once.
let pendingLoad: Promise<void> | null = null

// The follow buttons of a page asking within the same tick, by event: one call answers
// all of their subjects.
const pendingFollows = new Map<NotificationEvent | null, { scopes: Array<NotificationScope>, answer: Promise<Array<NotificationResolved>> }>()

function isSameScope(a: NotificationScope | null, b: NotificationScope | null) {
  if (a === null || b === null) return a === b
  return a.class === b.class && a.id === b.id
}

export function isSameRule(setting: NotificationRuleKey, key: NotificationRuleKey) {
  return isSameScope(setting.scope, key.scope)
    && setting.event === key.event
    && setting.reason === key.reason
    && setting.channel === key.channel
}

// Every dimension left out is `null`, so that a caller only names what it decides about.
export function ruleKey(key: Partial<NotificationRuleKey>): NotificationRuleKey {
  return {
    scope: key.scope ?? null,
    event: key.event ?? null,
    reason: key.reason ?? null,
    channel: key.channel ?? null,
  }
}

// The rules the user set about their notifications (see udata's `NotificationSetting`),
// and the only place writing them.
//
// Reading is udata's job (`/notifications/resolved/`). Writing is not: which rule to
// write depends on how udata ranks them, a subject beating an event beating a reason,
// and whether a rule says "concerned" or names a channel. That knowledge lives here, in
// one function per thing a user can ask for, rather than in every button.
export function useNotificationSettings() {
  const settings = useState<Array<NotificationSetting> | null>('notification-settings', () => null)
  const { $api } = useNuxtApp()

  function load() {
    if (settings.value) return Promise.resolve()
    pendingLoad ??= $api<Array<NotificationSetting>>('/api/1/notifications/settings/')
      .then((loaded) => {
        settings.value = loaded
      })
      .finally(() => {
        pendingLoad = null
      })
    return pendingLoad
  }

  // The value of exactly this rule, `null` when the user never set it.
  function ruleValue(key: Partial<NotificationRuleKey>): boolean | null {
    const full = ruleKey(key)
    return settings.value?.find(setting => isSameRule(setting, full))?.enabled ?? null
  }

  // The user's "concerned" rules on a subject restricted to some of its notifications.
  function narrowerRules(scope: NotificationScope) {
    return (settings.value ?? []).filter(setting => setting.event !== null && setting.reason === null && setting.channel === null && isSameScope(setting.scope, scope))
  }

  // `null` removes the rule, so the broader rules or the defaults apply again.
  async function setRule(key: Partial<NotificationRuleKey>, enabled: boolean | null) {
    const full = ruleKey(key)
    const saved = await $api<NotificationSetting | ''>('/api/1/notifications/settings/', {
      method: 'PUT',
      body: { ...full, enabled },
    })
    const others = (settings.value ?? []).filter(setting => !isSameRule(setting, full))
    settings.value = saved ? [...others, saved] : others
  }

  // What the user gets for every combination of the given keys, in one call.
  function resolve(query: { scopes?: Array<NotificationScope>, events?: Array<NotificationEvent>, reasons?: Array<NotificationReason> }) {
    return $api<Array<NotificationResolved>>('/api/1/notifications/resolved/', {
      query: {
        scope: query.scopes?.map(scope => `${scope.class}:${scope.id}`),
        event: query.events,
        reason: query.reasons,
      },
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
        return resolve({ scopes, events: event ? [event] : undefined })
      })
      batch = { scopes, answer }
      pendingFollows.set(event, batch)
    }
    batch.scopes.push(scope)
    const answers = await batch.answer
    return answers.find(answer => isSameScope(answer.scope, scope))!
  }

  // Following is a "concerned" rule on the subject. Stopping withdraws one's own follow
  // first: if nothing else brings these notifications, that is enough, and the defaults
  // of the user's role stay untouched. Only when a role or a broader follow still brings
  // them is "not concerned" written.
  //
  // Without an event, it is about everything on the subject: the follows restricted to
  // some of its notifications go too, or they would beat the "no" being written.
  async function follow(scope: NotificationScope, event: NotificationEvent | null, followed: boolean) {
    await load()
    const key = { scope, event }
    if (!event && !followed) {
      await Promise.all(narrowerRules(scope).map(setting => setRule(setting, null)))
    }
    if (followed) {
      await setRule(key, true)
      return resolveFollow(scope, event)
    }
    if (ruleValue(key)) await setRule(key, null)
    let resolved = await resolveFollow(scope, event)
    if (resolved.channels.length) {
      await setRule(key, false)
      resolved = await resolveFollow(scope, event)
    }
    return resolved
  }

  // On or off for everything about a subject. The narrower rules on the same subject go
  // first: left behind, a follow restricted to its discussions would beat the "no".
  async function followSubject(scope: NotificationScope, followed: boolean) {
    await load()
    await Promise.all(narrowerRules(scope).map(setting => setRule(setting, null)))
    await setRule({ scope }, followed)
  }

  // Whether some kinds of notification reach the user through a channel. Only a channel
  // turned off is stored: turned on is the default, and a stored "yes" would also beat
  // the "no" of an organization's channels, being on an event.
  function kindChannelOn(events: Array<NotificationEvent>, channel: NotificationChannel) {
    return events.every(event => ruleValue({ event, channel }) !== false)
  }

  async function setKindChannel(events: Array<NotificationEvent>, channel: NotificationChannel, on: boolean) {
    await Promise.all(events.map(event => setRule({ event, channel }, on ? null : false)))
  }

  // The channels of an organization replace those of the kinds of notification for
  // everything about it; `null` keeps those.
  function organizationChannels(scope: NotificationScope): Array<NotificationChannel> | null {
    const chosen = (['app', 'mail'] as const).map(channel => [channel, ruleValue({ scope, channel })] as const)
    if (chosen.every(([, enabled]) => enabled === null)) return null
    return chosen.filter(([, enabled]) => enabled).map(([channel]) => channel)
  }

  async function setOrganizationChannels(scope: NotificationScope, channels: Array<NotificationChannel> | null) {
    await Promise.all((['app', 'mail'] as const).map(channel => setRule({ scope, channel }, channels ? channels.includes(channel) : null)))
  }

  // "Turn everything off" is a field of the user rather than a rule: no rule, however
  // precise, can bring anything back.
  const me = useMaybeMe()
  const paused = computed(() => me.value?.notifications_paused ?? false)

  async function setPaused(value: boolean) {
    const updated = await $api<Me>('/api/1/me/', { method: 'PUT', body: { notifications_paused: value } })
    if (me.value) me.value.notifications_paused = updated.notifications_paused
  }

  return { settings, load, ruleValue, narrowerRules, setRule, resolve, resolveFollow, follow, followSubject, kindChannelOn, setKindChannel, organizationChannels, setOrganizationChannels, paused, setPaused }
}
