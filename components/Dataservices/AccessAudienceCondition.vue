<template>
  <li
    :key="audience"
    class="flex gap-1 items-center"
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
import type { DataserviceAccessAudienceCondition, DataserviceAccessAudienceType } from '@datagouv/components-next'

const props = defineProps<{
  audience: DataserviceAccessAudienceType
  condition: DataserviceAccessAudienceCondition
}>()

const { getAccessAudienceCondition, getAccessAudienceType } = useAccessAudience()

const accessAudienceCondition = computed(() => getAccessAudienceCondition(props.condition))

const accessAudienceLabel = computed(() => getAccessAudienceType(props.audience))
</script>
