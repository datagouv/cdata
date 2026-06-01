import type { UserNotification } from '~/types/notifications'

export function requireAction(notification: UserNotification) {
  const cls = notification.details.class
  if (notification.handled_at) return false
  return cls === 'MembershipRequestNotificationDetails'
    || cls === 'TransferRequestNotificationDetails'
    || (cls === 'ValidateHarvesterNotificationDetails' && notification.details.status === 'pending')
}
