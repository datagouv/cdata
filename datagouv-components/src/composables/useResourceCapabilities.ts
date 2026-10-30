import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useComponentsConfig } from '../config'
import { isOrganizationCertified } from '../functions/organizations'
import { getGeneratedFormats, getWfsExportFormats } from '../functions/resourceCapabilities'
import { hasPreviewError } from '../functions/previewErrors'
import { detectOgcService, getParsingErrorMessage, getParsingErrorStep, isImagePreviewFormat, isPmtilesSourceFormat } from '../functions/resources'
import type { Dataset, DatasetV2 } from '../types/datasets'
import type { Resource, WfsMetadata } from '../types/resources'
import { useHasTabularData } from './useHasTabularData'
import { useTranslation } from './useTranslation'

const URL_FORMATS = ['url', 'doi', 'www:link', 'www:link-1.0-http--link', 'www:link-1.0-http--partners', 'www:link-1.0-http--related', 'www:link-1.0-http--samples']

// Which preview the data tab shows. Single source of truth: the viewer renders it and
// the skeleton picks the matching placeholder shape, so each holding its own copy of
// this precedence would let the two drift apart.
export type PreviewKind = 'json' | 'pdf' | 'xml' | 'image' | 'datafair' | 'openapi' | 'tabular' | 'url' | 'unavailable'

export function useResourceCapabilities(
  resource: MaybeRefOrGetter<Resource>,
  dataset: MaybeRefOrGetter<Dataset | DatasetV2>,
) {
  const config = useComponentsConfig()
  const { t } = useTranslation()
  const checkTabularData = useHasTabularData()

  const hasTabularData = computed(() => {
    const r = toValue(resource)
    return checkTabularData(r)
  })

  const hasPmtiles = computed(() => {
    const r = toValue(resource)
    return r.extras['analysis:parsing:pmtiles_url'] || r.format === 'pmtiles'
  })

  const hasDatafairPreview = computed(() => {
    const d = toValue(dataset)
    const r = toValue(resource)
    return isOrganizationCertified(d.organization) && r.extras['datafairEmbed']
  })

  const hasOpenAPIPreview = computed(() => {
    const d = toValue(dataset)
    const r = toValue(resource)
    return isOrganizationCertified(d.organization) && r.extras['apidocUrl']
  })

  const ogcService = computed(() => detectOgcService(toValue(resource)))
  const ogcWms = computed(() => ogcService.value === 'wms')

  // The map is built from a pmtiles export; when that export fails we still want
  // to show the Carte tab, but with the reason it could not be generated.
  const hasPmtilesError = computed(() => {
    const r = toValue(resource)
    if (getParsingErrorStep(r) === 'pmtiles_export') return true
    return r.extras['analysis:error'] === 'File too large to download' && isPmtilesSourceFormat(r.format)
  })
  const pmtilesError = computed(() => hasPmtilesError.value ? getParsingErrorMessage(toValue(resource)) : null)

  const generatedFormats = computed(() => getGeneratedFormats(toValue(resource), config.tabularApiUrl))

  const wfsFormats = computed(() => {
    return getWfsExportFormats(toValue(resource))
  })

  const defaultWfsProjection = computed<string | null>(() => {
    const r = toValue(resource)
    const wfsMetadata = r.extras['analysis:parsing:ogc_metadata'] as WfsMetadata | null
    if (!wfsMetadata || wfsMetadata.format !== `wfs`) return null
    return wfsMetadata?.detected_layer?.default_crs ?? null
  })

  const isResourceUrl = computed(() => URL_FORMATS.includes(toValue(resource).format))

  // A dedicated preview always wins over the interactive table: a PDF that also
  // carries a parsing table is a PDF first.
  const previewKind = computed<PreviewKind>(() => {
    const format = toValue(resource).format?.toLowerCase()
    if (isResourceUrl.value) return 'url'
    if (format === 'json') return 'json'
    if (format === 'pdf') return 'pdf'
    if (format === 'xml') return 'xml'
    if (isImagePreviewFormat(format)) return 'image'
    if (hasDatafairPreview.value) return 'datafair'
    if (hasOpenAPIPreview.value) return 'openapi'
    if (hasTabularData.value) return 'tabular'
    return 'unavailable'
  })

  // Whether opening the resource shows its content (a preview or a map), not just
  // its metadata. A link resource is only ever meant to be visited, exploring
  // nothing in product — the eye badge in lists must not claim otherwise.
  const hasPreview = computed(() => (previewKind.value !== 'unavailable' && previewKind.value !== 'url') || !!hasPmtiles.value || ogcWms.value)

  const tabsOptions = computed(() => {
    const r = toValue(resource)
    const options = []

    const dataTab = { key: 'data', label: hasTabularData.value ? t('Données') : t('Aperçu') }
    const mapTab = { key: 'map', label: t('Carte') }
    const hasMap = hasPmtiles.value || ogcWms.value

    // The map is the most visual preview: when it is available, show it first,
    // and keep the data tab only when another preview (table, PDF, JSON…)
    // exists for the same resource.
    if (hasMap) {
      options.push(mapTab)
      if (previewKind.value !== 'unavailable') {
        options.push(dataTab)
      }
    }
    else if (hasPmtilesError.value) {
      if (previewKind.value !== 'unavailable') {
        options.push(dataTab)
      }
      options.push(mapTab)
    }
    // Without a map, keep the data tab only when it shows something valuable:
    // a real preview, or a diagnosable error explaining why it cannot render.
    // When neither exists the tab would only reproduce the generic "cannot be
    // previewed" panel, so it is dropped.
    else if (previewKind.value !== 'unavailable' || hasPreviewError(r)) {
      options.push(dataTab)
    }

    if (hasTabularData.value) {
      options.push({ key: 'data-structure', label: t('Structure des données') })
    }

    if (r.description) {
      options.push({ key: 'description', label: t('Description') })
    }

    options.push({ key: 'metadata', label: t('Métadonnées') })

    if (hasTabularData.value) {
      options.push({ key: 'api', label: t('API') })
    }

    return options
  })

  return {
    previewKind,
    hasPreview,
    hasTabularData,
    hasPmtiles,
    hasPmtilesError,
    pmtilesError,
    hasDatafairPreview,
    hasOpenAPIPreview,
    ogcService,
    ogcWms,
    generatedFormats,
    wfsFormats,
    defaultWfsProjection,
    isResourceUrl,
    tabsOptions,
  }
}
