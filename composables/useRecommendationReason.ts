import type { Recommendation } from '~/types/recommendations'

export function useRecommendationReason() {
  const { t } = useI18n()
  const config = useRuntimeConfig()
  const getRecommendationReason = (recommendation: Recommendation) => {
    switch (recommendation.source) {
      case 'edito':
        return t(`par l'équipe de {site}`, { site: config.public.title })
      case 'schemas':
        return t('car conforme au schéma {schéma}', { schema: recommendation.reason })
      default:
        throwOnNever(recommendation.source, 'Unknown source')
    }
  }
  return { getRecommendationReason }
}
