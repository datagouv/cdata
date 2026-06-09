import type { UserNotification } from '~/types/notifications'
import type { PaginatedArray } from '~/types/types'
import { toast } from '@datagouv/components-next'
import { useTranslation } from '~/composables/useTranslation'
import { canMarkAsRead } from '~/utils/notifications'

const page = ref(1)
const PAGE_SIZE = 10
const nextPage = ref<string | null>(null)
const pendingNotifications = ref<PaginatedArray<UserNotification> | null>(null)
const notificationsCombinedList = ref<Array<UserNotification>>([])
const notificationsToRead = computed(() => notificationsCombinedList.value.filter(n => canMarkAsRead(n)))

export function useNotifications() {
  const { start, finish } = useLoadingIndicator()
  const { $api } = useNuxtApp()
  const { t } = useTranslation()

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
    catch {
      toast.error(t('Erreur lors du chargement des notifications'))
    }
    finally {
      finish()
    }
  }

  async function refreshNotifications() {
    const toPage = page.value
    notificationsCombinedList.value = []
    for (let p = 1; p <= toPage; p++) {
      page.value = p
      await loadNotifications()
    }
    refreshPendingNotifications()
  }

  async function refreshPendingNotifications() {
    start()
    try {
      pendingNotifications.value = await $api<PaginatedArray<UserNotification>>('/api/1/notifications/', {
        params: {
          page_size: 1,
          page: 1,
          handled: false,
        },
      })
    }
    catch {
      toast.error(t('Erreur lors du chargement des notifications'))
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
    pendingNotifications: pendingNotifications,
    nextPage: nextPage,
    notificationsCombinedList: notificationsCombinedList,
    notificationsToRead,
    loadNotifications,
    loadMoreNotifications,
    refreshNotifications,
    refreshPendingNotifications,
  }
}
