import type { Recommendation } from '~/types/recommendations'

export function useRecommendationReason() {
  const { t } = useTranslation()
  const config = useRuntimeConfig()
  const getRecommendationReason = (recommendation: Recommendation, count: number) => {
    switch (recommendation.source) {
      case 'edito':
        return t(`par l'équipe de {site}`, { site: config.public.title })
      case 'schemas':
        return t('car lié au schéma de données | car liés aux schémas de données', { count })
      default:
        return t('')
    }
  }
  return { getRecommendationReason }
}
