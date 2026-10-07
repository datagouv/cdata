import type { DataserviceReference, DatasetReference, OrganizationReference, ReuseReference, UserReference } from '@datagouv/components-next'
import type { Thread } from './discussions'
import type { HarvesterSource } from './harvesters'

export type CommonNotification = {
  created_at: string
  handled_at: string | null
  id: string
  last_modified: string
  user: UserReference
  // Resolved by acting on the subject (accepting a request, validating a source) rather than by reading it
  requires_action: boolean
  // Why the user was concerned, recorded when the notification was sent
  reasons: Array<NotificationReason>
}

export type MembershipRequestNotification = CommonNotification & {
  type: 'organization.membership.requested' | 'organization.membership.invited'
  details: {
    class: 'MembershipRequestNotificationDetails'
    request_organization: OrganizationReference
    request_user: UserReference
  }
}

export type TransferRequestNotification = CommonNotification & {
  type: 'transfer.requested'
  details: {
    class: 'TransferRequestNotificationDetails'
    transfer_owner: OrganizationReference | UserReference
    transfer_recipient: OrganizationReference | UserReference
    transfer_subject: DatasetReference | DataserviceReference | ReuseReference
  }
}

export type NewBadgeNotification = CommonNotification & {
  type: 'organization.badge.certified'
    | 'organization.badge.public-service'
    | 'organization.badge.company'
    | 'organization.badge.association'
    | 'organization.badge.local-authority'
  details: {
    class: 'NewBadgeNotificationDetails'
    organization: OrganizationReference
  }
}

export type DiscussionNotification = CommonNotification & {
  type: 'discussion.new' | 'discussion.comment' | 'discussion.closed'
  details: {
    class: 'DiscussionNotificationDetails'
    discussion: Thread
    message_id: string | null
    title: string
  }
}

export type MembershipAcceptedNotification = CommonNotification & {
  type: 'organization.membership.accepted'
  details: {
    class: 'MembershipAcceptedNotificationDetails'
    organization: OrganizationReference
  }
}

export type MembershipRefusedNotification = CommonNotification & {
  type: 'organization.membership.refused'
  details: {
    class: 'MembershipRefusedNotificationDetails'
    organization: OrganizationReference
  }
}

export type ValidateHarvesterNotification = CommonNotification & {
  type: 'harvest.source.pending' | 'harvest.source.accepted' | 'harvest.source.refused'
  details: {
    class: 'ValidateHarvesterNotificationDetails'
    source: HarvesterSource
  }
}

export type ReuseCreatedNotification = CommonNotification & {
  type: 'reuse.created'
  details: {
    class: 'ReuseCreatedNotificationDetails'
    reuse: ReuseReference
    dataset: DatasetReference
  }
}

export type DataserviceCreatedNotification = CommonNotification & {
  type: 'dataservice.created'
  details: {
    class: 'DataserviceCreatedNotificationDetails'
    dataservice: DataserviceReference
    dataset: DatasetReference
  }
}

export type UserNotification = MembershipRequestNotification | TransferRequestNotification | NewBadgeNotification | DiscussionNotification | MembershipAcceptedNotification | MembershipRefusedNotification | ValidateHarvesterNotification | ReuseCreatedNotification | DataserviceCreatedNotification

// The udata event classes a rule can name: a single notification or its family.
export type NotificationEvent = 'DiscussionEvent' | 'NewDiscussion' | 'NewDiscussionComment' | 'DiscussionClosed'
  | 'DatasetReusedEvent' | 'ReuseCreated' | 'DataserviceCreated'

export type NotificationChannel = 'app' | 'mail'

export type MailCadence = 'immediate' | 'daily' | 'weekly'

export type NotificationScope = {
  class: 'Organization' | 'Discussion' | 'Dataset' | 'Reuse' | 'Dataservice' | 'Post' | 'Topic'
  id: string
}

// Why a user is concerned by a notification. Sysadmin notifications are not configurable.
export type NotificationReason = 'owner'
  | 'organization.admin'
  | 'organization.editor'
  | 'organization.partial_editor'
  | 'discussion.participant'
  | 'explicit_subscriber'

// What identifies a rule: every dimension is optional, `null` meaning "whatever it is"
// (everywhere, every notification, whatever the reason, whether concerned at all).
export type NotificationRuleKey = {
  scope: NotificationScope | null
  event: NotificationEvent | null
  reason: NotificationReason | null
  channel: NotificationChannel | null
}

export type NotificationSetting = NotificationRuleKey & {
  id: string
  enabled: boolean
  // `null` without a scope, or once the subject is out of the user's reach
  subject: {
    title: string
    page: string
    organization: OrganizationReference | null
  } | null
}

// A rule everybody starts with, read only where the user's own rules say nothing.
export type NotificationDefaultRule = NotificationRuleKey & {
  enabled: boolean
}

// Whether, why and where the user hears about an event on a subject, rules and
// defaults applied.
export type NotificationResolved = {
  channels: Array<NotificationChannel>
  reasons: Array<NotificationReason>
}
