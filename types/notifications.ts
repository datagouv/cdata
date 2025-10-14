export type CommonNotification = {
  created_on: string
}

export type MembershipRequestNotification = CommonNotification & {
  details: {
    id: string
    organization: string
    user: {
      avatar: string
      fullname: string
      id: string
    }
  }
  type: 'membership_request'
}

export type UserNotification = MembershipRequestNotification
