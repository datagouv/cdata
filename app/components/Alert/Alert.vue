<template>
  <div :class="classes">
    <component
      :is="titleLevel"
      v-if="$slots.title && !isSm"
      class="fr-alert__title"
    >
      <slot name="title" />
    </component>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AlertSize, AlertType } from '~/types/alert'
import type { TitleLevel } from '~/types/html'

const props = withDefaults(defineProps<{
  size?: AlertSize
  titleLevel?: TitleLevel
  type: AlertType
}>(), {
  size: 'md',
  titleLevel: 'h3',
})

const type = computed(() => `fr-alert--${props.type}`)
const size = computed(() => props.size === 'md' ? '' : `fr-alert--${props.size}`)
const isSm = computed(() => props.size === 'sm')
const classes = computed(() => `fr-alert ${type.value} ${size.value}`)
</script>
