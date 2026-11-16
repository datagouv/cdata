<template>
  <Badge
    size="xs"
    :tone="display.tone"
  >
    {{ display.label }}
  </Badge>
</template>

<script setup lang="ts">
import { Badge, type BadgeTone, type Resource } from '@datagouv/components-next'

const props = defineProps<{
  resource: Resource
}>()

const { t } = useTranslation()

type AvailabilityDisplay = { label: string, tone: BadgeTone }

const display = computed<AvailabilityDisplay>(() => {
  if (props.resource.extras['check:available'] === true) return { label: t('Disponible'), tone: 'primary' }
  if (props.resource.extras['check:available'] === false) return { label: t('Indisponible'), tone: 'danger' }
  return { label: t('Inconnu'), tone: 'warning' }
})
</script>
