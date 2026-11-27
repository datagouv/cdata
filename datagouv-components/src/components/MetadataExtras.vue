<template>
  <ExtraAccordion
    v-if="hasExtras"
    :button-text
    :title-text
    :extra="normalizedExtra"
    :title-level
  >
    <template #buttons>
      <slot name="buttons" />
    </template>
  </ExtraAccordion>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ExtraAccordion from './ExtraAccordion.vue'

const props = defineProps<{
  buttonText: string
  titleText: string
  extra: Record<string, unknown> | null | undefined
  titleLevel: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
}>()

const hasExtras = computed(() => props.extra && Object.keys(props.extra).length > 0)
const normalizedExtra = computed(() => props.extra ?? {})
</script>
