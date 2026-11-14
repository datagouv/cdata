<template>
  <AdminBadge
    size="sm"
    :type="display.type"
    :icon="display.icon"
  >
    {{ display.label }}
  </AdminBadge>
</template>

<script setup lang="ts">
import type { AccessType } from '@datagouv/components-next'
import { RiLockLine, RiPassValidLine } from '@remixicon/vue'
import type { Component } from 'vue'
import type { AdminBadgeType } from '~/types/types'

const props = defineProps<{ accessType: AccessType }>()

const { t } = useTranslation()

const display = computed<{ label: string, type: AdminBadgeType, icon?: Component }>(() => {
  return {
    open: {
      label: t('Ouvert'),
      type: 'success' as const,
    },
    open_with_account: {
      label: t('Ouvert avec un compte'),
      type: 'yellow' as const,
      icon: RiPassValidLine,
    },
    restricted: {
      label: t('Accès restreint'),
      type: 'warning' as const,
      icon: RiLockLine,
    },
  }[props.accessType]
})
</script>
