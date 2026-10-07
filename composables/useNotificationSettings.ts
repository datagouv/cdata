import type { NotificationChannel, NotificationEvent, NotificationReason, NotificationResolved, NotificationRuleKey, NotificationScope, NotificationSetting } from '~/types/notifications'

// Shared by every discussion of a page: they all read the same list, fetched once.
let pendingLoad: Promise<void> | null = null

// The follow buttons of a page asking within the same tick, by event: one call answers
// all of their subjects.
const pendingFollows = new Map<NotificationEvent, { scopes: Array<NotificationScope>, answer: Promise<Array<NotificationResolved>> }>()

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

  // `null` removes the rule, so the broader rules or the defaults apply again.
  async function setRule(key: Partial<NotificationRuleKey>, enabled: boolean | null) {
    const full = ruleKey(key)
    const saved = await $api<NotificationSetting | ''>('/api/1/notifications/settings/', {
      method: 'PUT',
      body: { ...full, enabled },
    })
    const others = (settings.value ?? []).filter(setting => !isSameRule(setting, full))
    if (!saved) {
      settings.value = others
      return
    }
    // Only the listing describes the subject: keep the description already known.
    const subject = settings.value?.find(setting => isSameScope(setting.scope, saved.scope))?.subject ?? null
    settings.value = [...others, { ...saved, subject }]
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

  // What the user gets for some notifications on a subject, batched with the other
  // subjects asked about in the same tick.
  async function resolveFollow(scope: NotificationScope, event: NotificationEvent): Promise<NotificationResolved> {
    let batch = pendingFollows.get(event)
    if (!batch) {
      const scopes: Array<NotificationScope> = []
      const answer = Promise.resolve().then(() => {
        pendingFollows.delete(event)
        return resolve({ scopes, events: [event] })
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
  async function follow(scope: NotificationScope, event: NotificationEvent, followed: boolean) {
    await load()
    const key = { scope, event }
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
    const narrower = (settings.value ?? []).filter(setting => setting.event !== null && setting.reason === null && setting.channel === null && isSameScope(setting.scope, scope))
    await Promise.all(narrower.map(setting => setRule(setting, null)))
    await setRule({ scope }, followed)
  }

  // A reason's channels, as chosen, whatever the default: a choice does not follow a later
  // change of the defaults.
  //
  // Only a channel turned off is stored, though. A channel turned on is what every reason
  // gets anyway, and storing it would beat "turn everything off", being more specific.
  // No channel at all turns both off rather than saying "not concerned": a follow, being
  // on a subject, would beat "not concerned", whereas nothing brings back a channel
  // turned off.
  async function setReasonChannels(reason: NotificationReason, channels: Array<NotificationChannel>) {
    await Promise.all([
      setRule({ reason }, channels.length ? true : null),
      ...(['app', 'mail'] as const).map(channel => setRule({ reason, channel }, channels.includes(channel) ? null : false)),
    ])
  }

  // "Turn everything off" is a rule on each channel, everywhere: a channel rule is the
  // only kind a follow cannot bring back (see udata's `resolve`).
  const allOff = computed(() => ruleValue({ channel: 'app' }) === false && ruleValue({ channel: 'mail' }) === false)

  async function setAllOff(off: boolean) {
    await Promise.all([
      setRule({ channel: 'app' }, off ? false : null),
      setRule({ channel: 'mail' }, off ? false : null),
    ])
  }

  return { settings, load, ruleValue, setRule, resolve, resolveFollow, follow, followSubject, setReasonChannels, allOff, setAllOff }
}
