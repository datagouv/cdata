<template>
  <div class="relative">
    <div :class="{ 'opacity-50 min-h-64': loading }">
      <!-- Keep the previous content while reloading, dimmed under the loader:
           dropping it collapses the page height, which makes the browser clamp
           the scroll and throws the reader back to the top. -->
      <slot
        v-if="!hasError && data"
        :data="data"
      />
      <slot
        v-else-if="hasError"
        name="error"
      >
        <div class="text-center py-8 text-gray-500">
          Une erreur est survenue lors du chargement.
        </div>
      </slot>
    </div>
    <div
      v-if="loading"
      class="absolute inset-0 flex justify-center items-center min-h-64"
    >
      <AnimatedLoader class="size-24" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed } from 'vue'
import AnimatedLoader from './AnimatedLoader.vue'

const props = defineProps<{
  status: string
  data: T | null | undefined
}>()

defineSlots<{
  default: (props: { data: NonNullable<T> }) => unknown
  error: () => unknown
}>()

const loading = computed(() => {
  return props.status === 'idle' || props.status === 'pending'
})

const hasError = computed(() => {
  return props.status === 'error'
})
</script>
