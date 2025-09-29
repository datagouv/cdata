export type AccessType = 'open' | 'restricted' | 'open_with_account'

export type AccessAudienceCondition = 'yes' | 'no' | 'under_condition'

export type AccessAudienceType = 'local_authority_and_administration' | 'company_and_association' | 'private'

export type AccessAudience = { role: AccessAudienceType, condition: AccessAudienceCondition }

export type WithAccessType = {
  access_type: AccessType
  access_audiences: Array<AccessAudience>
  access_type_reason_category: string | null
  access_type_reason: string | null
  authorization_request_url: string | null
}

export type AccessTypeForm = {
  access_type: AccessType
  access_audiences: Record<AccessAudienceType, AccessAudienceCondition>
  access_type_reason_category: string | null
  access_type_reason: string | null
  authorization_request_url: string | null
}

export function accessTypeToApi(form: AccessTypeForm): WithAccessType {
  return {
    access_type: form.access_type,
    access_audiences: (Object.entries(form.access_audiences) as Array<[AccessAudienceType, AccessAudienceCondition]>).map(([role, condition]) => ({ role, condition })),
    authorization_request_url: form.authorization_request_url || null,
    access_type_reason_category: form.access_type_reason_category && form.access_type_reason_category !== 'other' ? form.access_type_reason_category : null,
    access_type_reason: form.access_type_reason || null,
  }
}

export function accessTypeToForm(accessType: WithAccessType): AccessTypeForm {
  return {
    access_type: accessType.access_type,
    access_audiences: Object.fromEntries(accessType.access_audiences.map(a => [a.role, a.condition])) as { [K in AccessAudienceType]: AccessAudienceCondition },
    access_type_reason_category: accessType.access_type_reason_category || (accessType.access_type_reason ? 'other' : ''),
    access_type_reason: accessType.access_type_reason || '',
    authorization_request_url: accessType.authorization_request_url || '',
  }
}
