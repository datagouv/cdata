<script setup lang="ts">
import type { Dataservice } from '@datagouv/components-next'
import type { AdminBadgeType } from '~/types/types'

const props = defineProps<{
  dataservice: Dataservice
}>()

const { t } = useTranslation()

const status = computed<{ label: string, type: AdminBadgeType }>(() => {
  if (props.dataservice.deleted_at) {
    return {
      label: t('Supprimé'),
      type: 'danger',
    }
  }
  else if (props.dataservice.archived_at) {
    return {
      label: t('Archivé'),
      type: 'warning',
    }
  }
  else if (props.dataservice.private) {
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
