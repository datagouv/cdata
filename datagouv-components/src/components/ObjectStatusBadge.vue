<template>
  <Badge
    :size
    :tone="display.tone"
    :icon="size === 'sm' ? display.icon : null"
    :medium="size === 'sm'"
  >
    {{ display.label }}
  </Badge>
</template>

<script setup lang="ts">
import { RiArchiveLine, RiDeleteBinLine, RiDraftLine } from '@remixicon/vue'
import { computed, type Component } from 'vue'
import { useTranslation } from '../composables/useTranslation'
import type { ObjectStatus } from '../functions/objectStatus'
import { throwOnNever } from '../functions/never'
import type { BadgeTone } from '../types/ui'
import Badge from './Badge.vue'

// Compact table cells (xs) show the bare status, cards and pages (sm) a medium label with its icon
const props = withDefaults(defineProps<{
  status: ObjectStatus
  size?: 'xs' | 'sm'
}>(), {
  size: 'sm',
})

const { t } = useTranslation()

type StatusDisplay = { label: string, tone: BadgeTone, icon: Component | null }

const display = computed<StatusDisplay>(() => {
  switch (props.status) {
    case 'deleted':
      return { label: t('Supprimé'), tone: 'danger', icon: RiDeleteBinLine }
    case 'archived':
      return { label: t('Archivé'), tone: 'warning', icon: RiArchiveLine }
    case 'private':
      return { label: t('Brouillon'), tone: 'neutral', icon: RiDraftLine }
    case 'public':
      return { label: t('Public'), tone: 'primary', icon: null }
    default:
      return throwOnNever(props.status, 'Unknown object status')
  }
})
</script>
