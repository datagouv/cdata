<template>
  <!-- A real tooltip instead of a `title`: reachable with the keyboard and on touch screens,
       and the condition is also read by screen readers, not only shown by the icon colour. -->
  <Tooltip
    as="li"
    class="flex"
  >
    <span class="inline-flex items-center gap-1">
      <component
        :is="accessAudienceCondition.icon"
        class="size-4 flex-none"
        :class="accessAudienceCondition.color"
        aria-hidden="true"
      />
      {{ accessAudienceLabel }}
      <span class="sr-only">: {{ accessAudienceCondition.description }}</span>
    </span>
    <template #tooltip>
      <strong class="block font-bold">{{ accessAudienceLabel }}</strong>
      {{ accessAudienceCondition.description }}
    </template>
  </Tooltip>
</template>

<script setup lang="ts">
import { Tooltip, type AccessAudienceCondition, type AccessAudienceType } from '@datagouv/components-next'

const props = defineProps<{
  audience: AccessAudienceType
  condition: AccessAudienceCondition
}>()

const { getAccessAudienceCondition, getAccessAudienceType } = useAccessAudience()

const accessAudienceCondition = computed(() => getAccessAudienceCondition(props.condition))

const accessAudienceLabel = computed(() => getAccessAudienceType(props.audience))
</script>
