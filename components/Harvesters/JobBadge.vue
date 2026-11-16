<template>
  <Badge
    size="xs"
    :tone="status.type"
  >
    {{ status.label }}
  </Badge>
</template>

<script setup lang="ts">
import { throwOnNever, Badge } from '@datagouv/components-next'
import type { HarvesterJob, HarvesterJobPreview } from '~/types/harvesters'
import type { BadgeTone } from '@datagouv/components-next'

const props = defineProps<{
  job: HarvesterJob | HarvesterJobPreview
}>()

const { t } = useTranslation()

const status = computed<{ label: string, type: BadgeTone }>(() => {
  switch (props.job.status) {
    case 'pending':
      return {
        label: t('En attente'),
        type: 'neutral',
      }
    case 'initializing':
      return {
        label: t(`En cours d'initialisation`),
        type: 'primary',
      }
    case 'initialized':
      return {
        label: t('Initialisé'),
        type: 'neutral',
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
