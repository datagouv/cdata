<script setup lang="ts">
import type { Dataset, DatasetV2 } from '@datagouv/components-next'
import type { AdminBadgeType } from '~/types/types'

const props = defineProps<{
  dataset: Dataset | DatasetV2
}>()

const { t } = useTranslation()

const status = computed<{ label: string, type: AdminBadgeType }>(() => {
  if (props.dataset.deleted) {
    return {
      label: t('Supprimé'),
      type: 'danger',
    }
  }
  else if (props.dataset.archived) {
    return {
      label: t('Archivé'),
      type: 'warning',
    }
  }
  else if (props.dataset.private) {
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
})
</script>

<template>
  <AdminBadge
    size="xs"
    :type="status.type"
  >
    {{ status.label }}
  </AdminBadge>
</template>
