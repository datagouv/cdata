import type { UserNotification } from '~/types/notifications'

export function requireAction(notification: UserNotification) {
  return !notification.handled_at && notification.requires_action
}

export function canMarkAsRead(notification: UserNotification) {
  return !notification.handled_at && !requireAction(notification)
}

export function localMarkAsRead(notification: UserNotification) {
  notification.handled_at = new Date().toISOString()
}
