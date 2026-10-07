import type { UserNotification } from '~/types/notifications'

export function requireAction(notification: UserNotification) {
  return !notification.handled_at && notification.requires_action
}

export function canMarkAsRead(notification: UserNotification) {
  return !notification.handled_at && !requireAction(notification)
}

// The notifications users can turn off (udata's `ConfigurableEvent`): only they offer a
// way out from the list.
const CONFIGURABLE_TYPES: Array<UserNotification['type']> = [
  'discussion.new',
  'discussion.comment',
  'discussion.closed',
  'reuse.created',
  'dataservice.created',
]

export function isConfigurable(notification: UserNotification) {
  return CONFIGURABLE_TYPES.includes(notification.type)
}

export function localMarkAsRead(notification: UserNotification) {
  notification.handled_at = new Date().toISOString()
}
