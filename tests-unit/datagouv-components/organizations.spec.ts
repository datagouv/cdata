import { describe, expect, it } from 'vitest'
import { CERTIFIED, COMPANY, getOrganizationType, isOrganizationCertified, LOCAL_AUTHORITY, PUBLIC_SERVICE } from '~/datagouv-components/src/functions/organizations'
import type { Organization } from '~/datagouv-components/src/types/organizations'

const organization = (...kinds: string[]) => ({ badges: kinds.map(kind => ({ kind })) } as unknown as Organization)

describe('isOrganizationCertified', () => {
  // Business rule: the certified checkmark requires the CERTIFIED badge AND a
  // public nature (public service or local authority)
  it('requires both the badge and a public nature', () => {
    expect(isOrganizationCertified(organization(CERTIFIED, PUBLIC_SERVICE))).toBe(true)
    expect(isOrganizationCertified(organization(CERTIFIED, LOCAL_AUTHORITY))).toBe(true)
    expect(isOrganizationCertified(organization(CERTIFIED, COMPANY))).toBe(false)
    expect(isOrganizationCertified(organization(PUBLIC_SERVICE))).toBe(false)
    expect(isOrganizationCertified(null)).toBe(false)
  })
})

describe('getOrganizationType', () => {
  it('prefers local authority over public service when both badges are present', () => {
    expect(getOrganizationType(organization(PUBLIC_SERVICE, LOCAL_AUTHORITY))).toEqual(LOCAL_AUTHORITY)
  })
})
