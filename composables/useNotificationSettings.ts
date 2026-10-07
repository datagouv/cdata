import type { NotificationRuleKey, NotificationScope, NotificationSetting } from '~/types/notifications'

// Shared by every discussion of a page: they all read the same list, fetched once.
let pendingLoad: Promise<void> | null = null

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

// The value of exactly this rule among `rules`, `null` when there is none.
export function ruleValueIn(rules: Array<NotificationRuleKey & { enabled: boolean }>, key: Partial<NotificationRuleKey>): boolean | null {
  const full = ruleKey(key)
  return rules.find(rule => isSameRule(rule, full))?.enabled ?? null
}

// The rules the user set about their notifications (see udata's `NotificationSetting`).
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

  function ruleValue(key: Partial<NotificationRuleKey>): boolean | null {
    return ruleValueIn(settings.value ?? [], key)
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

  return { settings, load, ruleValue, setRule }
}
