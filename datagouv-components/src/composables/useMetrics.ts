import { useComponentsConfig } from '../config'
import { getOrganizationMetrics, getDatasetMetrics, getDataserviceMetrics, getReuseMetrics } from '../functions/metrics'

export function useMetrics() {
  const config = useComponentsConfig()

  if (!config.metricsApiUrl) {
    throw new Error('metricsApiUrl is not configured in @datagouv/components-next')
  }

  return {
    getOrganizationMetrics: (oid: string) => getOrganizationMetrics(oid, config.metricsApiUrl!),
    getDatasetMetrics: (datasetId: string) => getDatasetMetrics(datasetId, config.metricsApiUrl!),
    getDataserviceMetrics: (dataserviceId: string) => getDataserviceMetrics(dataserviceId, config.metricsApiUrl!),
    getReuseMetrics: (reuseId: string) => getReuseMetrics(reuseId, config.metricsApiUrl!),
  }
}
