<template>
  <Badge
    v-if="organization.deleted"
    :size
    tone="danger"
    :icon="size === 'sm' ? RiDeleteBinLine : null"
    :medium="size === 'sm'"
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
withDefaults(defineProps<{
  organization: Organization
  size?: 'xs' | 'sm'
}>(), {
  size: 'sm',
})

const { t } = useTranslation()
</script>
