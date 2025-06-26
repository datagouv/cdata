import type { Reuse } from '@datagouv/components-next'
import type { AdminBadgeType } from '~/types/types'

export function useReuseStatus() {
  const { t } = useI18n()

  const getReuseStatus = (reuse: Reuse): { label: string, type: AdminBadgeType } => {
    if (reuse.deleted) {
      return {
        label: t('Deleted'),
        type: 'danger',
      }
    }
    else if (reuse.archived) {
      return {
        label: t('Archived'),
        type: 'warning',
      }
    }
    else if (reuse.private) {
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
    getReuseStatus,
  }
}
