<template>
  <li
    :key="audience"
    class="flex gap-1 items-center"
    :title="`${accessAudienceLabel}: ${accessAudienceCondition.label}`"
  >
    <component
      :is="accessAudienceCondition.icon"
      class="size-4"
      :class="accessAudienceCondition.color"
    />
    {{ accessAudienceLabel }}
  </li>
</template>

<script setup lang="ts">
import type { AccessAudienceCondition, AccessAudienceType } from '@datagouv/components-next'

const props = defineProps<{
  audience: AccessAudienceType
  condition: AccessAudienceCondition
}>()

const { getAccessAudienceCondition, getAccessAudienceType } = useAccessAudience()

const accessAudienceCondition = computed(() => getAccessAudienceCondition(props.condition))

const accessAudienceLabel = computed(() => getAccessAudienceType(props.audience))
</script>
