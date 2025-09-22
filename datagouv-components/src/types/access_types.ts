export type AccessType = 'open' | 'restricted' | 'open_with_account'

export type AccessAudienceCondition = 'yes' | 'no' | 'under_condition'

export type AccessAudienceType = 'local_authority_and_administration' | 'company_and_association' | 'private'

export type AccessAudience = { role: AccessAudienceType, condition: AccessAudienceCondition }

export type WithAccessType = {
  access_type: AccessType
  access_type_reason: string | null
  authorization_request_url: string | null
  access_audiences: Array<AccessAudience>
}
