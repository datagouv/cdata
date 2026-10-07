import type { UserNotification } from '~/types/notifications'

export function requireAction(notification: UserNotification) {
  return !notification.handled_at && notification.requires_action
}

export function canMarkAsRead(notification: UserNotification) {
  return !notification.handled_at && !requireAction(notification)
}

// Every notification can be turned off but an action to take: leaving it unanswered
// would be a bug, not a setting.
export function isConfigurable(notification: UserNotification) {
  return !notification.requires_action
}

export function localMarkAsRead(notification: UserNotification) {
  notification.handled_at = new Date().toISOString()
}
