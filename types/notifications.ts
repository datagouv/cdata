import type { DataserviceReference, DatasetReference, OrganizationReference, ReuseReference, UserReference } from '@datagouv/components-next'
import type { DiscussionSubject, Thread } from './discussions'
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

// A dotted name and each of its prefixes: `a.b.c` gives `a`, `a.b` and `a.b.c`.
type DottedPrefixes<Name extends string> = Name extends `${infer Head}.${infer Rest}`
  ? Head | `${Head}.${DottedPrefixes<Rest>}`
  : Name

// What a rule can name: a notification type, or a dotted prefix of some (`discussion`
// covers `discussion.new`, `discussion.comment`…).
export type NotificationEvent = DottedPrefixes<UserNotification['type']>

type FirstSegment<Name extends string> = Name extends `${infer Head}.${string}` ? Head : Name

// The first segment of a type, the family a rule can turn off as a whole.
export type EventFamily = FirstSegment<UserNotification['type']>

export type MailCadence = 'immediate' | 'daily' | 'weekly'

export type NotificationScope = {
  class: DiscussionSubject['class'] | 'Discussion'
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

// What identifies a rule: every dimension is optional, `null` meaning "whatever it is"
// (everywhere, every notification).
export type NotificationRuleKey = {
  scope: NotificationScope | null
  event: NotificationEvent | null
}

// What the user may see of the subject of a rule, `null` once it is out of their reach.
export type NotificationSubjectSummary = {
  title: string
  page: string
  // The organization the subject belongs to, `null` for an organization itself
  organization: OrganizationReference | null
} | null

export type NotificationSetting = NotificationRuleKey & {
  id: string
  enabled: boolean
  // What made the user follow a subject: by hand, by editing it, or by taking part in its
  // discussions
  origin: 'followed' | 'edited' | 'discussed'
  // Also `null` without a scope
  subject: NotificationSubjectSummary
}

// Whether and why the user hears about an event on a subject, rules and defaults
// applied, pause aside. The keys asked about are echoed, one answer per subject.
export type NotificationResolved = {
  scope: NotificationScope
  event: NotificationEvent | null
  heard: boolean
  reasons: Array<NotificationReason>
  // The user said no to exactly this subject and event
  muted: boolean
  // The narrower events the user still follows on this subject
  followed_events: Array<NotificationEvent>
  subject: NotificationSubjectSummary
}

// What a follow button shows: the answer once read, `null` while it is read, `'failed'`
// when it could not be.
export type FollowState = NotificationResolved | null | 'failed'
