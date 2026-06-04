import type { UserNotification } from '~/types/notifications'
import { canMarkAsRead, localMarkAsRead } from '~/utils/notifications'

export function useMarkAsRead() {
  const loading = ref(false)
  const { refreshPendingNotifications } = useNotifications()
  const { $api } = useNuxtApp()

  const markAsRead = async (notification: UserNotification) => {
    if (notification.handled_at) {
      return
    }

    try {
      loading.value = true
      localMarkAsRead(notification)
      await $api(`/api/1/notifications/${notification.id}/read/`, { method: 'POST' })
      await refreshPendingNotifications()
    }
    finally {
      loading.value = false
    }
  }

  const markWithoutActionAsRead = async (notifications: Array<UserNotification>) => {
    const withoutAction = notifications.filter(n => canMarkAsRead(n))

    if (withoutAction.length === 0) {
      return
    }

    try {
      loading.value = true
      await Promise.all(
        withoutAction.map(notification =>
          $api(`/api/1/notifications/${notification.id}/read/`, { method: 'POST' }),
        ),
      )
      for (const n of withoutAction) {
        localMarkAsRead(n)
      }
      await refreshPendingNotifications()
    }
    finally {
      loading.value = false
    }
  }

  return {
    markAsRead,
    markWithoutActionAsRead,
    loading,
  }
}
