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

  function findRule(key: Partial<NotificationRuleKey>) {
    const full = ruleKey(key)
    return settings.value?.find(setting => isSameRule(setting, full))
  }

  // The value of exactly this rule, `null` when the user never set it.
  function ruleValue(key: Partial<NotificationRuleKey>): boolean | null {
    return findRule(key)?.enabled ?? null
  }

  // `null` removes the rule, so the broader rules or the defaults apply again.
  async function setRule(key: Partial<NotificationRuleKey>, enabled: boolean | null) {
    const existing = findRule(key)

    if (enabled === null) {
      if (!existing) return
      await $api(`/api/1/notifications/settings/${existing.id}/`, { method: 'DELETE' })
      settings.value = (settings.value ?? []).filter(setting => setting.id !== existing.id)
      return
    }

    const saved = await $api<NotificationSetting>('/api/1/notifications/settings/', {
      method: 'PUT',
      body: { ...ruleKey(key), enabled },
    })
    // Only the listing describes the subject: keep the description already known.
    const subject = settings.value?.find(setting => isSameScope(setting.scope, saved.scope))?.subject ?? null
    settings.value = [...(settings.value ?? []).filter(setting => setting.id !== saved.id), { ...saved, subject }]
  }

  return { settings, load, findRule, ruleValue, setRule }
}
