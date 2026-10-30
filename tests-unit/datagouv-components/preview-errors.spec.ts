import { createApp } from 'vue'
import { describe, expect, it } from 'vitest'
import { configKey, type ResolvedPluginConfig } from '~/datagouv-components/src/config'
import { getPreviewErrorInfo, getPreviewErrorInfoByType, getTransientErrorType, hasPreviewError } from '~/datagouv-components/src/functions/previewErrors'
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
    expect(info.userCta).toBe('')
    expect(info.producerCta).toBe('')
  })

  it('is unavailable when the checker could not reach the file', () => {
    const info = previewInfo({ 'check:available': false })
    expect(info.type).toBe('unavailable')
    expect(info.userCta).toBe('Signaler un problème avec cet aperçu')
  })

  it('is too_large for the file-size analysis error of a tabular file', () => {
    const info = previewInfo({ 'analysis:error': 'File too large to download' }, 'csv')
    expect(info.type).toBe('too_large')
  })

  it('does not blame size for a non-tabular file', () => {
    // hydra sets this error on any capped download (zip…), but "too large"
    // wrongly implies a preview exists and is merely oversized for files the
    // pipeline cannot re-process.
    const info = previewInfo({ 'analysis:error': 'File too large to download' }, 'zip')
    expect(info.type).toBe('unknown')
  })

  it('is malformed for a parsing error', () => {
    const info = previewInfo({ 'analysis:parsing:error': 'tabular:bad column' })
    expect(info.type).toBe('malformed')
  })

  it('is not malformed for a non-fatal geo export parsing error', () => {
    const info = previewInfo({ 'analysis:parsing:error': 'pmtiles_export:timeout' })
    expect(info.type).toBe('none')
  })

  it('is unknown for a generic analysis error', () => {
    const info = previewInfo({ 'analysis:error': 'Some step exploded' })
    expect(info.type).toBe('unknown')
  })
})

describe('getPreviewErrorInfo precedence', () => {
  it('lets unavailable win over a file-too-large error', () => {
    const info = previewInfo({ 'check:available': false, 'analysis:error': 'File too large to download' }, 'csv')
    expect(info.type).toBe('unavailable')
  })

  it('lets too_large win over a parsing error', () => {
    const info = previewInfo({ 'analysis:error': 'File too large to download', 'analysis:parsing:error': 'tabular:broken' }, 'csv')
    expect(info.type).toBe('too_large')
  })

  it('lets malformed win over a generic analysis error', () => {
    const info = previewInfo({ 'analysis:parsing:error': 'tabular:broken', 'analysis:error': 'Some step exploded' })
    expect(info.type).toBe('malformed')
  })

  it('leaves a blocked origin to runtime detection (no metadata family)', () => {
    // A blocked origin is only actionable for the fetch-based previews, which
    // diagnose it at runtime in PreviewWrapper (`getResourceCorsStatus`).
    expect(previewInfo({ 'check:cors:allow-origin': 'https://untrusted.example' }, 'pdf').type).toBe('none')
  })
})

describe('getPreviewErrorInfoByType', () => {
  it('interpolates the fileType for a sized too_large file', () => {
    expect(getPreviewErrorInfoByType('too_large', resource({}, 'csv'), 'CSV').message).toBe('Ce fichier CSV est trop volumineux pour être prévisualisé.')
  })

  it('describes an unknown size instead of blaming the file', () => {
    expect(getPreviewErrorInfoByType('too_large_unsized').message).toBe('La taille du fichier est inconnue. Il est possible que le fichier soit trop volumineux pour être prévisualisé.')
  })

  it('offers the preview-request CTA for tabular files only', () => {
    expect(getPreviewErrorInfoByType('too_large', resource({}, 'csv')).userCta).toBe('Cette prévisualisation vous serait utile ?')
    expect(getPreviewErrorInfoByType('too_large').userCta).toBe('')
  })

  it('has a text and no CTA for a transient load failure', () => {
    const info = getPreviewErrorInfoByType('load_failed')
    expect(info.message).toBe('L\'aperçu de ce fichier n\'a pas pu être chargé.')
    expect(info.userCta).toBe('')
    expect(info.producerCta).toBe('')
  })

  it('keeps the report CTAs for a failed map preview', () => {
    const info = getPreviewErrorInfoByType('map_load')
    expect(info.message).toBe('L\'aperçu cartographique de ce fichier n\'a pas pu être chargé.')
    expect(info.userCta).toBe('Signaler un problème avec cet aperçu')
    expect(info.producerCta).toBe('Signaler un problème')
  })

  it('has no CTA for a failed map generation', () => {
    const info = getPreviewErrorInfoByType('map_generation')
    expect(info.message).toBe('La carte n\'a pas pu être générée automatiquement pour ce fichier.')
    expect(info.userCta).toBe('')
    expect(info.producerCta).toBe('')
  })
})

describe('hasPreviewError', () => {
  it('is false without any diagnosis', () => {
    expect(withConfig({}, () => hasPreviewError(resource({})))).toBe(false)
  })

  it('is false for a blocked origin (runtime-only diagnosis)', () => {
    expect(withConfig({ trustedDomains: ['data.gouv.fr'] }, () => hasPreviewError(resource({ 'check:cors:allow-origin': 'https://untrusted.example' }, 'pdf')))).toBe(false)
  })

  it('is true for any diagnosed family', () => {
    for (const [extras, format] of [
      [{ 'check:available': false }, undefined],
      [{ 'analysis:error': 'File too large to download' }, 'csv'],
      [{ 'analysis:parsing:error': 'tabular:broken' }, undefined],
      [{ 'analysis:error': 'Some step exploded' }, undefined],
    ] as [Record<string, unknown>, string | undefined][]) {
      expect(withConfig({ trustedDomains: ['data.gouv.fr'] }, () => hasPreviewError(resource(extras, format)))).toBe(true)
    }
  })
})

describe('getTransientErrorType', () => {
  it('reports a transient load failure when the metadata gives no diagnosis', () => {
    expect(withConfig({}, () => getTransientErrorType(resource({})))).toBe('load_failed')
  })

  it('is undefined when the metadata already diagnoses an unavailable file', () => {
    expect(withConfig({}, () => getTransientErrorType(resource({ 'check:available': false })))).toBeUndefined()
  })

  it('is undefined when the metadata diagnoses a file too large', () => {
    expect(withConfig({}, () => getTransientErrorType(resource({ 'analysis:error': 'File too large to download' }, 'csv')))).toBeUndefined()
  })

  it('reports a transient failure for a non-tabular parsing error', () => {
    // A `pmtiles_export` step is not a tabular parsing error, so the metadata
    // gives no preview diagnosis and the failure is treated as transient.
    expect(withConfig({}, () => getTransientErrorType(resource({ 'analysis:parsing:error': 'pmtiles_export:timeout' }, 'geojson')))).toBe('load_failed')
  })
})
