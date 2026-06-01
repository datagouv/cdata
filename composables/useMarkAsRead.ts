import type { UserNotification } from '~/types/notifications'
import { requireAction } from '~/utils/notifications'

export function useMarkAsRead() {
  const loading = ref(false)
  const { refreshNotifications } = useNotifications()
  const { $api } = useNuxtApp()

  const markAsRead = async (notification: UserNotification) => {
    if (notification.handled_at) {
      return
    }

    try {
      loading.value = true
      await $api(`/api/1/notifications/${notification.id}/read/`, { method: 'POST' })
      await refreshNotifications()
    }
    finally {
      loading.value = false
    }
  }

  const markWithoutActionAsRead = async (notifications: Array<UserNotification>) => {
    const withoutAction = notifications.filter((n) => {
      return !n.handled_at && !requireAction(n)
    })

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
      await refreshNotifications()
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
