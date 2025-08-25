import { useI18n } from 'vue-i18n'
import type { Component } from 'vue'
import { RiBankLine, RiBuilding2Line, RiCommunityLine, RiGovernmentLine, RiUserLine } from '@remixicon/vue'
import { useComponentsConfig } from '../config'
import type { Organization } from '../types/organizations'

export const CERTIFIED = 'certified'
export const PUBLIC_SERVICE = 'public-service'
export const ASSOCIATION = 'association'
export const COMPANY = 'company'
export const LOCAL_AUTHORITY = 'local-authority'
export const OTHER = 'other'
export const USER = 'user'

export type OrganizationTypes = typeof PUBLIC_SERVICE | typeof ASSOCIATION | typeof COMPANY | typeof LOCAL_AUTHORITY | typeof OTHER

export type UserType = typeof USER

function constructUrl(baseUrl: string, path: string): string {
  const url = new URL(baseUrl)
  url.pathname = `${url.pathname}${path}`
  return url.toString()
}

export function isType(organization: Organization, type: OrganizationTypes) {
  return hasBadge(organization, type)
}

export function hasBadge(organization: Organization, kind: string) {
  return organization.badges.some(badge => badge.kind === kind)
}

export function getOrganizationTypes(): Array<{ type: OrganizationTypes | UserType, label: string, icon: Component | null }> {
  const { t } = useI18n()
  return [{
    type: PUBLIC_SERVICE,
    label: t('Service public'),
    icon: RiBankLine,
  },
  {
    type: LOCAL_AUTHORITY,
    label: t('Collectivité territoriale'),
    icon: RiGovernmentLine,
  },
  {
    type: ASSOCIATION,
    label: t('Association'),
    icon: RiCommunityLine,
  },
  {
    type: COMPANY,
    label: t('Entreprise'),
    icon: RiBuilding2Line,
  },
  {
    type: OTHER,
    label: t('Autre'),
    icon: null,
  },
  {
    type: USER,
    label: t('Utilisateur'),
    icon: RiUserLine,
  }]
}

export function findOrganizationType(searched: OrganizationTypes | UserType) {
  return getOrganizationTypes().find(type => type.type === searched)!
}

export function getOrganizationType(organization: Organization): OrganizationTypes {
  if (isType(organization, LOCAL_AUTHORITY)) {
    return LOCAL_AUTHORITY
  }
  else if (isType(organization, PUBLIC_SERVICE)) {
    return PUBLIC_SERVICE
  }
  else if (isType(organization, ASSOCIATION)) {
    return ASSOCIATION
  }
  else if (isType(organization, COMPANY)) {
    return COMPANY
  }
  else {
    return OTHER
  }
}

export function isOrganizationCertified(organization: Organization | null): boolean {
  if (!organization) return false
  return hasBadge(organization, CERTIFIED) && (isType(organization, PUBLIC_SERVICE) || isType(organization, LOCAL_AUTHORITY))
}

export default function getOrganizationOEmbedHtml(type: string, id: string): string {
  const config = useComponentsConfig()

  const staticUrl = constructUrl(config.staticUrl, 'oembed.js')
  return `<div data-udata-${type}="${id}" data-height="1500" data-width="1200"></div><script data-udata="${config.baseUrl}" src="${staticUrl}" async defer></script>`
}
