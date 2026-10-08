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

// What a rule can name: a notification type, or a dotted prefix of some (`discussion`
// covers `discussion.new`, `discussion.comment`…).
export type NotificationEvent = string

export type NotificationChannel = 'app' | 'mail'

export type MailCadence = 'immediate' | 'daily' | 'weekly'

export type NotificationScope = {
  class: 'Organization' | 'Discussion' | 'Dataset' | 'Reuse' | 'Dataservice' | 'Post' | 'Topic'
  id: string
}

// Why a user is concerned by a notification.
export type NotificationReason = 'owner'
  | 'organization.admin'
  | 'organization.editor'
  | 'organization.partial_editor'
  | 'discussion.participant'
  | 'explicit_subscriber'
  | 'contributor'
  | 'discussant'
  | 'requester'
  | 'sysadmin'

// What identifies a rule: every dimension is optional, `null` meaning "whatever it is"
// (everywhere, every notification).
export type NotificationRuleKey = {
  scope: NotificationScope | null
  event: NotificationEvent | null
}

export type NotificationSetting = NotificationRuleKey & {
  id: string
  enabled: boolean
  // What made the user follow a subject: by hand, or by editing it
  origin: 'followed' | 'edited' | 'discussed'
  // `null` without a scope, or once the subject is out of the user's reach
  subject: {
    title: string
    page: string
    organization: OrganizationReference | null
  } | null
}

// Whether, why and where the user hears about an event on a subject, rules and
// defaults applied. The keys asked about are echoed, one answer per combination.
export type NotificationResolved = {
  scope: NotificationScope | null
  event: NotificationEvent | null
  channels: Array<NotificationChannel>
  reasons: Array<NotificationReason>
}
