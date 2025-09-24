import type { Reuse } from '@datagouv/components-next'
import type { AdminBadgeType } from '~/types/types'

export function useReuseStatus() {
  const { t } = await useTranslation()

  const getReuseStatus = (reuse: Reuse): { label: string, type: AdminBadgeType } => {
    if (reuse.deleted) {
      return {
        label: t('Supprimé'),
        type: 'danger',
      }
    }
    else if (reuse.archived) {
      return {
        label: t('Archivé'),
        type: 'warning',
      }
    }
    else if (reuse.private) {
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
    getReuseStatus,
  }
}
