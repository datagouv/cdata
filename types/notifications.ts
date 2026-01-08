import type { DataserviceReference, DatasetReference, OrganizationReference, ReuseReference, UserReference } from '@datagouv/components-next'

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

export type CertifiedNotification = CommonNotification & {
  details: {
    class: 'CertifiedNotificationDetails'
    organization: OrganizationReference
  }
}

export type UserNotification = MembershipRequestNotification | TransferRequestNotification | CertifiedNotification
