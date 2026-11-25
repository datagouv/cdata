import type { AccessAudienceCondition, AccessAudienceType } from '@datagouv/components-next'
import { RiCheckDoubleLine, RiCheckLine, RiCloseLine } from '@remixicon/vue'

export function useAccessAudience() {
  const { t } = useTranslation()

  const getAccessAudienceCondition = (condition: AccessAudienceCondition) => {
    return {
      yes: { icon: RiCheckDoubleLine, label: t('Oui'), description: t('Peut accéder aux données.'), color: 'text-success-dark' },
      no: { icon: RiCloseLine, label: t('Non'), description: t('Ne peut pas accéder aux données.'), color: 'text-danger-dark' },
      under_condition: { icon: RiCheckLine, label: t('Sous condition'), description: t('Peut accéder aux données sous condition.'), color: 'text-warning-dark' },
    }[condition]
  }

  const getAccessAudienceType = (audience: AccessAudienceType) => {
    return {
      local_authority_and_administration: t('Collectivité et Administration'),
      company_and_association: t('Entreprise et Association'),
      private: t('Particulier'),
    }[audience]
  }
  return {
    getAccessAudienceCondition,
    getAccessAudienceType,
  }
}
