import type { DataserviceAccessAudienceCondition, DataserviceAccessAudienceType } from '@datagouv/components-next'
import { RiCheckDoubleLine, RiCheckLine, RiCloseLine } from '@remixicon/vue'

export function useAccessAudience() {
  const { t } = useI18n()

  const getAccessAudienceCondition = (condition: DataserviceAccessAudienceCondition) => {
    return {
      yes: { icon: RiCheckDoubleLine, label: t('Oui'), color: 'text-success-dark' },
      no: { icon: RiCloseLine, label: t('Non'), color: 'text-danger-dark' },
      under_condition: { icon: RiCheckLine, label: t('Sous condition'), color: 'text-warning-dark' },
    }[condition]
  }

  const getAccessAudienceType = (audience: DataserviceAccessAudienceType) => {
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
