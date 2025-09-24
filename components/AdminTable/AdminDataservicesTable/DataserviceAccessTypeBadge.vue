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

const { t } = useTranslation()

const label = computed(() => {
  return {
    open: t('Ouvert'),
    open_with_account: t('Ouvert avec compte'),
    restricted: t('Restreint'),
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
