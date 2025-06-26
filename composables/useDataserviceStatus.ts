import type { Dataservice } from '@datagouv/components-next'
import type { AdminBadgeType } from '~/types/types'

export function useDataserviceStatus() {
  const { t } = useI18n()
  const getDataserviceStatus = (dataservice: Dataservice): { label: string, type: AdminBadgeType } => {
    if (dataservice.deleted_at) {
      return {
        label: t('Deleted'),
        type: 'danger',
      }
    }
    else if (dataservice.archived_at) {
      return {
        label: t('Archived'),
        type: 'warning',
      }
    }
    else if (dataservice.private) {
      return {
        label: t('Draft'),
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
    getDataserviceStatus,
  }
}
