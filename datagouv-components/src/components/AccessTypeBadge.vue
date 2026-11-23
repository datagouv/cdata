<template>
  <Badge
    :size
    :tone="display.tone"
    :icon="bare ? null : display.icon"
    :medium="!bare"
  >
    {{ display.label }}
  </Badge>
</template>

<script setup lang="ts">
import { RiLockLine, RiPassValidLine } from '@remixicon/vue'
import { computed, type Component } from 'vue'
import { useTranslation } from '../composables/useTranslation'
import { throwOnNever } from '../functions/never'
import type { AccessType } from '../types/access_types'
import type { BadgeTone } from '../types/ui'
import Badge from './Badge.vue'

const props = withDefaults(defineProps<{
  accessType: AccessType
  size?: 'xs' | 'sm'
  // Table cells show the bare label, like the other statuses next to it
  bare?: boolean
}>(), {
  size: 'sm',
})

const { t } = useTranslation()

type AccessTypeDisplay = { label: string, tone: BadgeTone, icon: Component | null }

const display = computed<AccessTypeDisplay>(() => {
  switch (props.accessType) {
    case 'open':
      return { label: t('Ouvert'), tone: 'success', icon: null }
    case 'open_with_account':
      return { label: t('Ouvert avec un compte'), tone: 'yellow', icon: RiPassValidLine }
    case 'restricted':
      return { label: t('Accès restreint'), tone: 'warning', icon: RiLockLine }
    default:
      return throwOnNever(props.accessType, 'Unknown access type')
  }
})
</script>
