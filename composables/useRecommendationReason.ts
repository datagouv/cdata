import type { Recommendation } from '~/types/recommendations'

export function useRecommendationReason() {
  const { t } = useI18n()
  const config = useRuntimeConfig()
  const getRecommendationReason = (recommendation: Recommendation) => {
    switch (recommendation.source) {
      case 'matomo':
        return t('car fréquemment visité par les autres visiteurs')
      case 'edito':
        return t(`par l'équipe de {site}`, { site: config.public.title })
      case 'schema':
        return t('car conforme au schéma {schéma}', { schema: recommendation.reason })
      case 'local':
        return t('car consolidé au niveau national')
      default:
        throwOnNever(recommendation.source, 'Unknown source')
    }
  }
  return { getRecommendationReason }
}
