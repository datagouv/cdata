import type { DeepReadonly } from 'vue'
import type { UserNotification } from '~/types/notifications'

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

  const markWithoutActionAsRead = async (notifications: DeepReadonly<Array<UserNotification>> | Array<UserNotification>) => {
    const withoutActionUnread = notifications.filter((n) => {
      const cls = n.details.class
      if (cls === 'MembershipRequestNotificationDetails') return false
      if (cls === 'TransferRequestNotificationDetails') return false
      if (cls === 'ValidateHarvesterNotificationDetails') {
        return n.details.status !== 'pending'
      }
      return !n.handled_at
    })

    if (withoutActionUnread.length === 0) {
      return
    }

    try {
      loading.value = true
      await Promise.all(
        withoutActionUnread.map(notification =>
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
