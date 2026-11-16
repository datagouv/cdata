<template>
  <Badge
    size="xs"
    :tone="display.tone"
  >
    {{ display.label }}
  </Badge>
</template>

<script setup lang="ts">
import { Badge, type BadgeTone, type CommunityResource } from '@datagouv/components-next'

const props = defineProps<{
  communityResource: CommunityResource
}>()

const { t } = useTranslation()

type AvailabilityDisplay = { label: string, tone: BadgeTone }

// Community resources are checked later than the main ones: an unchecked one is not "unknown" but pending
const display = computed<AvailabilityDisplay>(() => {
  const extras = props.communityResource.extras
  const checked = extras && 'check:available' in extras
  if (checked && extras['check:available'] === false) return { label: t('Indisponible'), tone: 'danger' }
  if (checked) return { label: t('Disponible'), tone: 'primary' }
  return { label: t('Pas encore contrôlé'), tone: 'neutral' }
})
</script>
