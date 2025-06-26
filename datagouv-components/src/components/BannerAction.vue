<template>
  <div
    class="group flex items-center justify-between gap-2 rounded border p-2.5"
    :data-banner-action-type="type"
    :class="{
      '!border-datagouv bg-datagouv-lightest text-datagouv-dark': type === 'primary',
      '!border-danger-dark bg-danger-lightest text-danger-dark': type === 'danger',
      '!border-warning-dark bg-warning-lightest text-warning-dark': type === 'warning',
    }"
  >
    <div>
      <div class="text-gray-900">
        {{ title }}
      </div>
      <div
        v-if="$slots.default"
        class="text-xs mt-1"
      >
        <slot />
      </div>
    </div>
    <div v-if="$slots.button">
      <slot name="button" />
    </div>
  </div>
</template>

<script lang="ts">
import { provide, type InjectionKey } from 'vue'

export const bannerActionTypeKey = Symbol() as InjectionKey<'primary' | 'danger' | 'warning'>
</script>

<script setup lang="ts">
const props = defineProps<{
  type: 'primary' | 'danger' | 'warning'
  title: string
}>()

provide(bannerActionTypeKey, props.type)
</script>
