import type { Organization, User } from '@datagouv/components-next'

export type CommonNotification = {
  created_at: string
  handled_at: string | null
  id: string
  last_modified: string
  user: User
}

export type MembershipRequestNotification = CommonNotification & {
  details: {
    class: 'MembershipRequestNotificationDetails'
    request_organization: Organization
    request_user: User
  }
}

export type UserNotification = MembershipRequestNotification
