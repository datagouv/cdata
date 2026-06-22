import type { UserNotification } from '~/types/notifications'

export function requireAction(notification: UserNotification) {
  const cls = notification.details.class
  if (notification.handled_at) return false
  return cls === 'MembershipRequestNotificationDetails'
    || cls === 'TransferRequestNotificationDetails'
    || (cls === 'ValidateHarvesterNotificationDetails' && notification.details.status === 'pending')
}

export function canMarkAsRead(notification: UserNotification) {
  return !notification.handled_at && !requireAction(notification)
}

export function localMarkAsRead(notification: UserNotification) {
  notification.handled_at = new Date().toISOString()
}
