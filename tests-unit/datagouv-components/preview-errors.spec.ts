import { createApp } from 'vue'
import { describe, expect, it } from 'vitest'
import { configKey, type ResolvedPluginConfig } from '~/datagouv-components/src/config'
import { getPreviewErrorInfo, getPreviewErrorInfoByType, hasPreviewError } from '~/datagouv-components/src/functions/previewErrors'
import type { Resource } from '~/datagouv-components/src/types/resources'

// `getResourceCorsStatus` relies on `useComponentsConfig` (Vue inject): run the
// functions inside an app context providing the plugin config, like the other
// datagouv-components specs.
function withConfig<T>(config: Partial<ResolvedPluginConfig>, callback: () => T): T {
  const app = createApp({})
  app.provide(configKey, config as ResolvedPluginConfig)
  return app.runWithContext(callback)
}

function resource(extras: Record<string, unknown>, format?: string): Resource {
  return { id: 'res-1', format, extras } as unknown as Resource
}

function previewInfo(extras: Record<string, unknown>, format?: string): ReturnType<typeof getPreviewErrorInfo> {
  return withConfig({ trustedDomains: ['data.gouv.fr'] }, () => getPreviewErrorInfo(resource(extras, format)))
}

describe('getPreviewErrorInfo', () => {
  it('is none without any diagnosis', () => {
    const info = previewInfo({})
    expect(info.type).toBe('none')
    expect(info.isProducerFault).toBe(false)
    expect(info.userCta).toBe('')
    expect(info.producerCta).toBe('')
  })

  it('is unavailable when the checker could not reach the file', () => {
    const info = previewInfo({ 'check:available': false })
    expect(info.type).toBe('unavailable')
    expect(info.isProducerFault).toBe(true)
    expect(info.userCta).toBe('Signaler un problème avec cet aperçu')
  })

  it('is too_large for the file-size analysis error', () => {
    const info = previewInfo({ 'analysis:error': 'File too large to download' })
    expect(info.type).toBe('too_large')
    expect(info.isProducerFault).toBe(false)
  })

  it('is malformed for a parsing error', () => {
    const info = previewInfo({ 'analysis:parsing:error': 'tabular:bad column' })
    expect(info.type).toBe('malformed')
    expect(info.isProducerFault).toBe(true)
  })

  it('is unknown for a generic analysis error', () => {
    const info = previewInfo({ 'analysis:error': 'Some step exploded' })
    expect(info.type).toBe('unknown')
    expect(info.isProducerFault).toBe(false)
  })
})

describe('getPreviewErrorInfo precedence', () => {
  it('lets unavailable win over a blocked origin', () => {
    const info = previewInfo({ 'check:available': false, 'check:cors:allow-origin': 'https://untrusted.example' }, 'pdf')
    expect(info.type).toBe('unavailable')
  })

  it('lets unavailable win over a file-too-large error', () => {
    const info = previewInfo({ 'check:available': false, 'analysis:error': 'File too large to download' })
    expect(info.type).toBe('unavailable')
  })

  it('lets cors win over a file-too-large error', () => {
    const info = previewInfo({ 'check:cors:allow-origin': 'https://untrusted.example', 'analysis:error': 'File too large to download' }, 'pdf')
    expect(info.type).toBe('cors')
  })

  it('lets cors win over a parsing error', () => {
    const info = previewInfo({ 'check:cors:allow-origin': 'https://untrusted.example', 'analysis:parsing:error': 'tabular:broken' }, 'pdf')
    expect(info.type).toBe('cors')
  })

  it('lets too_large win over a parsing error', () => {
    const info = previewInfo({ 'analysis:error': 'File too large to download', 'analysis:parsing:error': 'tabular:broken' })
    expect(info.type).toBe('too_large')
  })

  it('lets malformed win over a generic analysis error', () => {
    const info = previewInfo({ 'analysis:parsing:error': 'tabular:broken', 'analysis:error': 'Some step exploded' })
    expect(info.type).toBe('malformed')
  })
})

describe('getPreviewErrorInfo cors/tabular interplay', () => {
  it('ignores a blocked origin for tabular-pipeline files', () => {
    const info = previewInfo({ 'check:cors:allow-origin': 'https://untrusted.example' }, 'csv')
    expect(info.type).toBe('none')
  })

  it('still reports cors for a non-tabular file', () => {
    expect(previewInfo({ 'check:cors:allow-origin': 'https://untrusted.example' }, 'pdf').type).toBe('cors')
  })
})

describe('getPreviewErrorInfoByType too_large CTA', () => {
  it('offers the preview-request CTA for tabular files only', () => {
    expect(getPreviewErrorInfoByType('too_large', resource({}, 'csv')).userCta).toBe('Cette prévisualisation vous serait utile ?')
    expect(getPreviewErrorInfoByType('too_large', resource({}, 'pdf')).userCta).toBe('')
    // Without a resource, we cannot resolve tabular-pipeline status.
    expect(getPreviewErrorInfoByType('too_large').userCta).toBe('')
  })
})

describe('hasPreviewError', () => {
  it('is false without any diagnosis', () => {
    expect(withConfig({}, () => hasPreviewError(resource({})))).toBe(false)
  })

  it('is true for any diagnosed family', () => {
    for (const [extras, format] of [
      [{ 'check:available': false }, undefined],
      [{ 'check:cors:allow-origin': 'https://untrusted.example' }, 'pdf'],
      [{ 'analysis:error': 'File too large to download' }, undefined],
      [{ 'analysis:parsing:error': 'tabular:broken' }, undefined],
      [{ 'analysis:error': 'Some step exploded' }, undefined],
    ] as [Record<string, unknown>, string | undefined][]) {
      expect(withConfig({ trustedDomains: ['data.gouv.fr'] }, () => hasPreviewError(resource(extras, format)))).toBe(true)
    }
  })
})
