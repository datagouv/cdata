<template>
  <Badge
    size="xs"
    :tone="display.tone"
  >
    {{ display.label }}
  </Badge>
</template>

<script setup lang="ts">
import { Badge, type BadgeTone } from '@datagouv/components-next'
import type { Thread } from '~/types/discussions'

const props = defineProps<{
  thread: Thread
}>()

const { t } = useTranslation()

type StatusDisplay = { label: string, tone: BadgeTone }

const display = computed<StatusDisplay>(() => {
  if (props.thread.closed) return { label: t('Clos'), tone: 'neutral' }
  // Only the opening message: nobody answered yet
  if (props.thread.discussion.length === 1) return { label: t('Nouveau'), tone: 'primary' }
  return { label: t('Répondu'), tone: 'neutral' }
})
</script>
