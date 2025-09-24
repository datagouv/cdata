<template>
  <AdminBadge
    size="xs"
    :type="status.type"
  >
    {{ status.label }}
  </AdminBadge>
</template>

<script setup lang="ts">
import { throwOnNever } from '@datagouv/components-next'
import type { HarvesterJob } from '~/types/harvesters'
import type { AdminBadgeType } from '~/types/types'

const props = defineProps<{
  job: HarvesterJob
}>()

const { t } = useTranslation()

const status = computed<{ label: string, type: AdminBadgeType }>(() => {
  switch (props.job.status) {
    case 'pending':
      return {
        label: t('En attente'),
        type: 'secondary',
      }
    case 'initializing':
      return {
        label: t(`En cours d'initialisation`),
        type: 'primary',
      }
    case 'initialized':
      return {
        label: t('Initialisé'),
        type: 'secondary',
      }
    case 'processing':
      return {
        label: t('En traitement'),
        type: 'primary',
      }
    case 'done':
      return {
        label: t('Terminé'),
        type: 'success',
      }
    case 'done-errors':
      return {
        label: t('Terminé avec des erreurs'),
        type: 'warning',
      }
    case 'failed':
      return {
        label: t('Échoué'),
        type: 'danger',
      }
    default:
      return throwOnNever(props.job.status, 'Unknown job status')
  }
})
</script>
