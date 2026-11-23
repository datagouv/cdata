<template>
  <Badge
    v-if="organization.deleted"
    tone="danger"
    :icon="RiDeleteBinLine"
    medium
  >
    {{ t('Supprimée') }}
  </Badge>
</template>

<script setup lang="ts">
import { RiDeleteBinLine } from '@remixicon/vue'
import { useTranslation } from '../composables/useTranslation'
import type { Organization } from '../types/organizations'
import Badge from './Badge.vue'

// An active organization has no status worth showing: only a deleted one gets a badge
defineProps<{
  organization: Organization
}>()

const { t } = useTranslation()
</script>
