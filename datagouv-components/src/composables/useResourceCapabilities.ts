import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useComponentsConfig } from '../config'
import { isOrganizationCertified } from '../functions/organizations'
import { getWfsExportFormats } from '../functions/resourceCapabilities'
import { detectOgcService, getParsingErrorMessage, getParsingErrorStep, isImagePreviewFormat } from '../functions/resources'
import type { Dataset, DatasetV2 } from '../types/datasets'
import type { Resource, WfsMetadata } from '../types/resources'
import { useHasTabularData } from './useHasTabularData'
import { useTranslation } from './useTranslation'

const GENERATED_FORMATS = ['parquet', 'pmtiles', 'geojson']
const URL_FORMATS = ['url', 'doi', 'www:link', 'www:link-1.0-http--link', 'www:link-1.0-http--partners', 'www:link-1.0-http--related', 'www:link-1.0-http--samples']

export function useResourceCapabilities(
  resource: MaybeRefOrGetter<Resource>,
  dataset: MaybeRefOrGetter<Dataset | DatasetV2>,
) {
  const config = useComponentsConfig()
  const { t } = useTranslation()
  const checkTabularData = useHasTabularData()

  const hasPreview = computed(() => {
    const format = toValue(resource).format?.toLowerCase()
    return format === 'json' || format === 'pdf' || format === 'xml' || isImagePreviewFormat(format)
  })

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
  const hasPmtilesError = computed(() => getParsingErrorStep(toValue(resource)) === 'pmtiles_export')
  const pmtilesError = computed(() => hasPmtilesError.value ? getParsingErrorMessage(toValue(resource)) : null)

  const generatedFormats = computed(() => {
    const r = toValue(resource)
    const formats = GENERATED_FORMATS
      .filter(format => `analysis:parsing:${format}_url` in r.extras)
      .map(format => ({
        url: r.extras[`analysis:parsing:${format}_url`] as string,
        size: r.extras[`analysis:parsing:${format}_size`] as number | undefined,
        format,
      }))
    if ('analysis:parsing:parsing_table' in r.extras) {
      formats.push({
        url: `${config.tabularApiUrl}/api/resources/${r.id}/data/json/`,
        size: undefined,
        format: 'json',
      })
    }
    return formats
  })

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

  const tabsOptions = computed(() => {
    const r = toValue(resource)
    const options = []

    const dataTab = { key: 'data', label: hasTabularData.value ? t('Données') : t('Aperçu') }
    const mapTab = { key: 'map', label: t('Carte') }
    const hasMap = hasPmtiles.value || ogcWms.value

    // The map is the most visual preview: when it is available, show it first.
    // When its generation failed, keep the data preview first and surface the
    // Carte tab (with its error) right after.
    if (hasMap) {
      options.push(mapTab, dataTab)
    }
    else if (hasPmtilesError.value) {
      options.push(dataTab, mapTab)
    }
    else {
      options.push(dataTab)
    }

    if (hasTabularData.value) {
      options.push({ key: 'data-structure', label: t('Structure des données') })
    }

    if (r.description) {
      options.push({ key: 'description', label: t('Description') })
    }

    options.push({ key: 'metadata', label: t('Métadonnées') })
    options.push({ key: 'downloads', label: t('Téléchargements') })

    if (hasTabularData.value) {
      options.push({ key: 'api', label: t('API') })
    }

    return options
  })

  return {
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
