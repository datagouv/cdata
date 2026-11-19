<template>
  <span>
    <Badge
      v-if="harvester.deleted"
      size="xs"
      tone="danger"
    >
      {{ $t('Supprimé') }}
    </Badge>
    <Badge
      v-else-if="!harvester.active"
      size="xs"
      tone="danger"
    >
      {{ $t('Inactif') }}
    </Badge>
    <Badge
      v-else-if="harvester.validation.state === 'refused'"
      size="xs"
      tone="danger"
    >
      {{ $t('Refusé') }}
    </Badge>
    <Badge
      v-else-if="harvester.validation.state === 'pending'"
      size="xs"
      tone="warning"
    >
      {{ $t('En attente de validation') }}
    </Badge>
    <JobBadge
      v-else-if="harvester.last_job"
      :job="harvester.last_job"
    />
    <Badge
      v-else
      size="xs"
      tone="neutral"
    >
      {{ $t(`Aucun job pour l'instant`) }}
    </Badge>
  </span>
</template>

<script setup lang="ts">
import { Badge } from '@datagouv/components-next'
import JobBadge from './JobBadge.vue'
import type { HarvesterSource } from '~/types/harvesters'

defineProps<{
  harvester: HarvesterSource
}>()
</script>
