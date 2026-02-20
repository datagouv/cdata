import { useComponentsConfig } from '../config'
import { getOrganizationMetrics, getDatasetMetrics, getDataserviceMetrics, getReuseMetrics, createDatasetsForOrganizationMetricsUrl } from '../functions/metrics'

export function useMetrics() {
  const config = useComponentsConfig()

  if (!config.metricsApiUrl || !config.apiBase) {
    throw new Error('metricsApiUrl and apiBase must be configured in @datagouv/components-next')
  }

  return {
    getOrganizationMetrics: (oid: string) => getOrganizationMetrics(oid, config.metricsApiUrl!),
    getDatasetMetrics: (datasetId: string) => getDatasetMetrics(datasetId, config.metricsApiUrl!),
    getDataserviceMetrics: (dataserviceId: string) => getDataserviceMetrics(dataserviceId, config.metricsApiUrl!),
    getReuseMetrics: (reuseId: string) => getReuseMetrics(reuseId, config.metricsApiUrl!),
    createDatasetsForOrganizationMetricsUrl: (organizationId: string) => createDatasetsForOrganizationMetricsUrl(organizationId, config.metricsApiUrl!, config.apiBase),
  }
}
