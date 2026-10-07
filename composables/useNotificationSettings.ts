import type { NotificationEvent, NotificationScope, NotificationSetting } from '~/types/notifications'

// Shared by every discussion of a page: they all read the same list, fetched once.
let pendingLoad: Promise<void> | null = null

function isSameScope(a: NotificationScope, b: NotificationScope) {
  return a.class === b.class && a.id === b.id
}

// The subjects the user follows or ignores.
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

  function findSetting(scope: NotificationScope, event: NotificationEvent) {
    return settings.value?.find(setting => isSameScope(setting.scope, scope) && setting.event === event)
  }

  function decisionFor(scope: NotificationScope, event: NotificationEvent): boolean | null {
    return findSetting(scope, event)?.enabled ?? null
  }

  // `null` withdraws the decision, so the user's reasons decide again.
  async function decide(scope: NotificationScope, event: NotificationEvent, enabled: boolean | null) {
    const existing = findSetting(scope, event)

    if (enabled === null) {
      if (!existing) return
      await $api(`/api/1/notifications/settings/${existing.id}/`, { method: 'DELETE' })
      settings.value = (settings.value ?? []).filter(setting => setting.id !== existing.id)
      return
    }

    const saved = await $api<NotificationSetting>('/api/1/notifications/settings/', {
      method: 'PUT',
      body: { scope, event, enabled },
    })
    settings.value = [...(settings.value ?? []).filter(setting => setting.id !== saved.id), saved]
  }

  return { settings, load, decisionFor, decide }
}
