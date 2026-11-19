<template>
  <Badge
    size="xs"
    :tone="status.tone"
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

type StatusDisplay = { label: string, tone: BadgeTone }

const status = computed<StatusDisplay>(() => {
  switch (props.job.status) {
    case 'pending':
      return {
        label: t('En attente'),
        tone: 'neutral',
      }
    case 'initializing':
      return {
        label: t(`En cours d'initialisation`),
        tone: 'primary',
      }
    case 'initialized':
      return {
        label: t('Initialisé'),
        tone: 'neutral',
      }
    case 'processing':
      return {
        label: t('En traitement'),
        tone: 'primary',
      }
    case 'done':
      return {
        label: t('Terminé'),
        tone: 'success',
      }
    case 'done-errors':
      return {
        label: t('Terminé avec des erreurs'),
        tone: 'warning',
      }
    case 'failed':
      return {
        label: t('Échoué'),
        tone: 'danger',
      }
    default:
      return throwOnNever(props.job.status, 'Unknown job status')
  }
})
</script>
