import { createApp } from 'vue'
import { describe, expect, it } from 'vitest'
import { configKey, type ResolvedPluginConfig } from '~/datagouv-components/src/config'
import { detectOgcService, getResourceCorsStatus, isCommunityResource } from '~/datagouv-components/src/functions/resources'
import type { CommunityResource, Resource } from '~/datagouv-components/src/types/resources'

// `useComponentsConfig` relies on Vue's inject: run the function inside an app
// context providing the plugin config.
function withConfig<T>(config: Partial<ResolvedPluginConfig>, callback: () => T): T {
  const app = createApp({})
  app.provide(configKey, config as ResolvedPluginConfig)
  return app.runWithContext(callback)
}

function resourceWithCors(extras: Record<string, unknown>): Resource {
  return { url: 'https://example.com/data.csv', extras } as unknown as Resource
}

const corsStatus = (extras: Record<string, unknown>, trustedDomains = ['data.gouv.fr']) =>
  withConfig({ trustedDomains }, () => getResourceCorsStatus(resourceWithCors(extras)))

describe('getResourceCorsStatus', () => {
  it('is unknown without CORS check data', () => {
    expect(corsStatus({})).toEqual('unknown')
  })

  it('allows a public wildcard origin', () => {
    expect(corsStatus({ 'check:cors:allow-origin': '*' })).toEqual('allowed')
  })

  it('allows trusted domains and their subdomains only', () => {
    expect(corsStatus({ 'check:cors:allow-origin': 'https://data.gouv.fr' })).toEqual('allowed')
    expect(corsStatus({ 'check:cors:allow-origin': 'https://www.data.gouv.fr' })).toEqual('allowed')
    expect(corsStatus({ 'check:cors:allow-origin': 'https://evil.com' })).toEqual('blocked')
    // A suffix that is not a subdomain must not match
    expect(corsStatus({ 'check:cors:allow-origin': 'https://notdata.gouv.fr' })).toEqual('blocked')
  })

  it('blocks an origin that is not a parseable URL', () => {
    expect(corsStatus({ 'check:cors:allow-origin': 'data.gouv.fr' })).toEqual('blocked')
  })

  it('requires the GET method when methods are advertised', () => {
    expect(corsStatus({ 'check:cors:allow-origin': '*', 'check:cors:allow-methods': 'GET, POST' })).toEqual('allowed')
    expect(corsStatus({ 'check:cors:allow-origin': '*', 'check:cors:allow-methods': 'get' })).toEqual('allowed')
    expect(corsStatus({ 'check:cors:allow-origin': '*', 'check:cors:allow-methods': 'POST' })).toEqual('blocked')
  })
})

describe('detectOgcService', () => {
  it('detects the format with or without the ogc: prefix', () => {
    expect(detectOgcService({ format: 'ogc:wfs', url: 'https://example.com' } as Resource)).toEqual('wfs')
    expect(detectOgcService({ format: 'wms', url: 'https://example.com' } as Resource)).toEqual('wms')
  })

  it('detects a GetCapabilities URL whatever the case', () => {
    const resource = { format: 'csv', url: 'https://example.com/geo?REQUEST=GetCapabilities&SERVICE=WFS' } as Resource
    expect(detectOgcService(resource)).toEqual('wfs')
  })

  it('returns false otherwise', () => {
    expect(detectOgcService({ format: 'csv', url: 'https://example.com/data.csv' } as Resource)).toBe(false)
  })
})

describe('isCommunityResource', () => {
  it('detects community resources by their ownership keys', () => {
    expect(isCommunityResource({ owner: null } as unknown as CommunityResource)).toBe(true)
    expect(isCommunityResource({ organization: null } as unknown as CommunityResource)).toBe(true)
    expect(isCommunityResource({ id: 'res-1' } as unknown as Resource)).toBe(false)
  })
})
