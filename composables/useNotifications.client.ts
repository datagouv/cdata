import type { UserNotification } from '~/types/notifications'
import type { PaginatedArray } from '~/types/types'

const page = ref(1)
const notifications = ref<PaginatedArray<UserNotification> | null>(null)
const notificationsCombinatedList = ref<Array<UserNotification>>([])

export function useNotifications() {
  const { start, finish } = useLoadingIndicator()
  const { $api } = useNuxtApp()

  async function loadNotifications() {
    start()
    try {
      notifications.value = await $api<PaginatedArray<UserNotification>>('api/1/notifications/', {
        params: {
          page_size: 10,
          page: page.value,
        },
      })
      notificationsCombinatedList.value.push(...notifications.value.data)
    }
    finally {
      finish()
    }
  }

  async function refreshNotifications() {
    start()
    try {
      page.value = 1
      notifications.value = await $api<PaginatedArray<UserNotification>>('api/1/notifications/', {
        params: {
          page_size: 10,
          page: page.value,
        },
      })
      notificationsCombinatedList.value = notifications.value.data
    }
    finally {
      finish()
    }
  }

  function loadMoreNotifications() {
    page.value++
    return loadNotifications()
  }
  return { notifications: readonly(notifications), notificationsCombinatedList: readonly(notificationsCombinatedList), loadNotifications, loadMoreNotifications, refreshNotifications }
}
