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

export type NotificationCategory = 'discussions' | 'reuses'

export type NotificationChannel = 'app' | 'mail'

export type MailCadence = 'immediate' | 'daily' | 'weekly'

export type NotificationScope = {
  class: 'Organization' | 'Discussion' | 'Dataset' | 'Reuse' | 'Dataservice' | 'Post' | 'Topic'
  id: string
}

// A decision the user took. Whatever has no decision follows the defaults of the user's role.
export type NotificationSetting = {
  id: string
  // `null` covers every subject the user is concerned with
  scope: NotificationScope | null
  category: NotificationCategory
  channel: NotificationChannel
  enabled: boolean
}
