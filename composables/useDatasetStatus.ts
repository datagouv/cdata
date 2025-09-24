import type { Dataset, DatasetV2 } from '@datagouv/components-next'
import type { AdminBadgeType } from '~/types/types'

export function useDatasetStatus() {
  const { t } = useTranslation()
  const getDatasetStatus = (dataset: Dataset | DatasetV2): { label: string, type: AdminBadgeType } => {
    if (dataset.deleted) {
      return {
        label: t('Supprimé'),
        type: 'danger',
      }
    }
    else if (dataset.archived) {
      return {
        label: t('Archivé'),
        type: 'warning',
      }
    }
    else if (dataset.private) {
      return {
        label: t('Brouillon'),
        type: 'secondary',
      }
    }
    else {
      return {
        label: t('Public'),
        type: 'primary',
      }
    }
  }
  return {
    getDatasetStatus,
  }
}
