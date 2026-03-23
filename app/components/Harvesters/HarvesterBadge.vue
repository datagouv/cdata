<template>
  <span>
    <AdminBadge
      v-if="harvester.deleted"
      size="xs"
      type="danger"
    >
      {{ $t('Supprimé') }}
    </AdminBadge>
    <AdminBadge
      v-else-if="!harvester.active"
      size="xs"
      type="danger"
    >
      {{ $t('Inactif') }}
    </AdminBadge>
    <AdminBadge
      v-else-if="harvester.validation.state === 'refused'"
      size="xs"
      type="danger"
    >
      {{ $t('Refusé') }}
    </AdminBadge>
    <AdminBadge
      v-else-if="harvester.validation.state === 'pending'"
      size="xs"
      type="warning"
    >
      {{ $t('En attente de validation') }}
    </AdminBadge>
    <JobBadge
      v-else-if="harvester.last_job"
      :job="harvester.last_job"
    />
    <AdminBadge
      v-else
      size="xs"
      type="secondary"
    >
      {{ $t(`Aucun job pour l'instant`) }}
    </AdminBadge>
  </span>
</template>

<script setup lang="ts">
import AdminBadge from '../AdminBadge/AdminBadge.vue'
import JobBadge from './JobBadge.vue'
import type { HarvesterSource } from '~/types/harvesters'

defineProps<{
  harvester: HarvesterSource
}>()
</script>
