import type { CERTIFIED, PUBLIC_SERVICE, ASSOCIATION, LOCAL_AUTHORITY, COMPANY, DataserviceReference, DatasetReference, OrganizationReference, ReuseReference, UserReference } from '@datagouv/components-next'
import type { Thread } from './discussions'

export type CommonNotification = {
  created_at: string
  handled_at: string | null
  id: string
  last_modified: string
  user: UserReference
}

export type MembershipRequestNotification = CommonNotification & {
  details: {
    class: 'MembershipRequestNotificationDetails'
    request_organization: OrganizationReference
    request_user: UserReference
  }
}

export type TransferRequestNotification = CommonNotification & {
  details: {
    class: 'TransferRequestNotificationDetails'
    transfer_owner: OrganizationReference | UserReference
    transfer_recipient: OrganizationReference | UserReference
    transfer_subject: DatasetReference | DataserviceReference | ReuseReference
  }
}

export type NewBadgeNotification = CommonNotification & {
  details: {
    class: 'NewBadgeNotificationDetails'
    kind: typeof CERTIFIED | typeof PUBLIC_SERVICE | typeof ASSOCIATION | typeof LOCAL_AUTHORITY | typeof COMPANY
    organization: OrganizationReference
  }
}

export type DiscussionNotification = CommonNotification & {
  details: {
    class: 'DiscussionNotificationDetails'
    status: 'new_discussion' | 'new_comment' | 'closed'
    discussion: Thread
    message_id: string | null
    title: string
  }
}

export type MembershipAcceptedNotification = CommonNotification & {
  details: {
    class: 'MembershipAcceptedNotificationDetails'
    organization: OrganizationReference
  }
}

export type MembershipRefusedNotification = CommonNotification & {
  details: {
    class: 'MembershipRefusedNotificationDetails'
    organization: OrganizationReference
  }
}

export type UserNotification = MembershipRequestNotification | TransferRequestNotification | NewBadgeNotification | DiscussionNotification | MembershipAcceptedNotification | MembershipRefusedNotification
