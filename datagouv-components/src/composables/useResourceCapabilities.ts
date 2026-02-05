import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useComponentsConfig } from '../config'
import { useTranslation } from './useTranslation'
import { detectOgcService } from '../functions/resources'
import { isOrganizationCertified } from '../functions/organizations'
import type { Resource } from '../types/resources'
import type { Dataset, DatasetV2 } from '../types/datasets'

const GENERATED_FORMATS = ['parquet', 'pmtiles', 'geojson']
const URL_FORMATS = ['url', 'doi', 'www:link', 'www:link-1.0-http--link', 'www:link-1.0-http--partners', 'www:link-1.0-http--related', 'www:link-1.0-http--samples']

export function useResourceCapabilities(
  resource: MaybeRefOrGetter<Resource>,
  dataset: MaybeRefOrGetter<Dataset | DatasetV2>,
) {
  const config = useComponentsConfig()
  const { t } = useTranslation()

  const hasPreview = computed(() => {
    const format = toValue(resource).format?.toLowerCase()
    return format === 'json' || format === 'pdf' || format === 'xml'
  })

  const hasTabularData = computed(() => {
    const r = toValue(resource)
    return config.tabularApiUrl
      && r.extras['analysis:parsing:parsing_table']
      && !r.extras['analysis:parsing:error']
      && (config.tabularAllowRemote || r.filetype === 'file')
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

  const isResourceUrl = computed(() => URL_FORMATS.includes(toValue(resource).format))

  const tabsOptions = computed(() => {
    const r = toValue(resource)
    const options = []

    if (hasTabularData.value) {
      options.push({ key: 'data', label: t('Données') })
    }
    else if (hasPreview.value || hasDatafairPreview.value || hasOpenAPIPreview.value) {
      options.push({ key: 'data', label: t('Aperçu') })
    }

    if (hasTabularData.value) {
      options.push({ key: 'data-structure', label: t('Structure des données') })
    }

    if (hasPmtiles.value || ogcWms.value) {
      options.push({ key: 'map', label: t('Carte') })
    }

    if (r.description) {
      options.push({ key: 'description', label: t('Description') })
    }

    options.push({ key: 'metadata', label: t('Métadonnées') })
    options.push({ key: 'downloads', label: t('Téléchargements') })

    if (hasTabularData.value) {
      options.push({ key: 'swagger', label: t('Swagger') })
    }

    return options
  })

  return {
    hasPreview,
    hasTabularData,
    hasPmtiles,
    hasDatafairPreview,
    hasOpenAPIPreview,
    ogcService,
    ogcWms,
    generatedFormats,
    isResourceUrl,
    tabsOptions,
  }
}
