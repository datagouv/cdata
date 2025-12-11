<script setup lang="ts">
import type { Reuse } from '@datagouv/components-next'
import type { AdminBadgeType } from '~/types/types'

const props = defineProps<{
  reuse: Reuse
}>()

const { t } = useTranslation()

const status = computed<{ label: string, type: AdminBadgeType }>(() => {
  if (props.reuse.deleted) {
    return {
      label: t('Supprimé'),
      type: 'danger',
    }
  }
  else if (props.reuse.archived) {
    return {
      label: t('Archivé'),
      type: 'warning',
    }
  }
  else if (props.reuse.private) {
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
