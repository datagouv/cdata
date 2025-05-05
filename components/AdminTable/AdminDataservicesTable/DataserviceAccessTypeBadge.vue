<template>
  <AdminBadge
    size="sm"
    :type
  >
    {{ label }}
  </AdminBadge>
</template>

<script setup lang="ts">
import type { Dataservice } from '@datagouv/components-next'
import type { AdminBadgeType } from '~/types/types'

const props = defineProps<{ dataservice: Dataservice }>()

const { t } = useI18n()

const label = computed(() => {
  return {
    open: t('Open'),
    open_with_account: t('Open with account'),
    restricted: t('Restricted'),
  }[props.dataservice.access_type]
})

const type = computed(() => {
  return {
    open: 'success' as AdminBadgeType,
    open_with_account: 'warning' as AdminBadgeType,
    restricted: 'warning' as AdminBadgeType,
  }[props.dataservice.access_type]
})
</script>
