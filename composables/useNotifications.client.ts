import type { UserNotification } from '~/types/notifications'
import type { PaginatedArray } from '~/types/types'

const page = ref(1)
const PAGE_SIZE = 10
const nextPage = ref<string | null>(null)
const pendingNotifications = ref<PaginatedArray<UserNotification> | null>(null)
const notificationsCombinedList = ref<Array<UserNotification>>([])

export function useNotifications() {
  const { start, finish } = useLoadingIndicator()
  const { $api } = useNuxtApp()

  async function loadNotifications() {
    start()
    try {
      const notifications = await $api<PaginatedArray<UserNotification>>('/api/1/notifications/', {
        params: {
          page_size: PAGE_SIZE,
          page: page.value,
        },
      })
      notificationsCombinedList.value.push(...notifications.data)
      nextPage.value = notifications.next_page
    }
    finally {
      finish()
    }
  }

  async function refreshNotifications() {
    start()
    try {
      page.value = 1
      const notifications = await $api<PaginatedArray<UserNotification>>('/api/1/notifications/', {
        params: {
          page_size: PAGE_SIZE,
          page: page.value,
        },
      })
      notificationsCombinedList.value = notifications.data
      nextPage.value = notifications.next_page
      pendingNotifications.value = await $api<PaginatedArray<UserNotification>>('/api/1/notifications/', {
        params: {
          page_size: 1,
          page: page.value,
          handled: false,
        },
      })
    }
    finally {
      finish()
    }
  }

  function loadMoreNotifications() {
    page.value++
    return loadNotifications()
  }
  return {
    pendingNotifications: readonly(pendingNotifications),
    nextPage: readonly(nextPage),
    notificationsCombinedList: readonly(notificationsCombinedList),
    loadNotifications,
    loadMoreNotifications,
    refreshNotifications,
  }
}
