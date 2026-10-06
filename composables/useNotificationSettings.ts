import type { NotificationCategory, NotificationChannel, NotificationScope, NotificationSetting } from '~/types/notifications'

// Shared by every discussion of a page: they all read the same list, fetched once.
let pendingLoad: Promise<void> | null = null

function isSameScope(a: NotificationScope | null, b: NotificationScope | null) {
  if (a === null || b === null) return a === b
  return a.class === b.class && a.id === b.id
}

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

  function findSetting(scope: NotificationScope | null, category: NotificationCategory, channel: NotificationChannel) {
    return settings.value?.find(setting => isSameScope(setting.scope, scope) && setting.category === category && setting.channel === channel)
  }

  function decisionFor(scope: NotificationScope | null, category: NotificationCategory, channel: NotificationChannel): boolean | null {
    return findSetting(scope, category, channel)?.enabled ?? null
  }

  // `null` withdraws the decision, so the default applies again.
  async function decide(scope: NotificationScope | null, category: NotificationCategory, channel: NotificationChannel, enabled: boolean | null) {
    const existing = findSetting(scope, category, channel)

    if (enabled === null) {
      if (!existing) return
      await $api(`/api/1/notifications/settings/${existing.id}/`, { method: 'DELETE' })
      settings.value = (settings.value ?? []).filter(setting => setting.id !== existing.id)
      return
    }

    const saved = await $api<NotificationSetting>('/api/1/notifications/settings/', {
      method: 'PUT',
      body: { scope, category, channel, enabled },
    })
    settings.value = [...(settings.value ?? []).filter(setting => setting.id !== saved.id), saved]
  }

  return { settings, load, decisionFor, decide }
}
