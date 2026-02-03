import type { DeepReadonly } from 'vue'
import type { UserNotification } from '~/types/notifications'

export function useMarkAsRead() {
  const loading = ref(false)
  const { refreshNotifications } = useNotifications()
  const { $api } = useNuxtApp()
  const markAsRead = async (notification: DeepReadonly<UserNotification>) => {
    try {
      loading.value = true
      await $api(`/api/1/notifications/${notification.id}/read/`, { method: 'POST' })
      await refreshNotifications()
    }
    finally {
      loading.value = false
    }
  }
  return {
    markAsRead,
    loading,
  }
}
