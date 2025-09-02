<template>
  <dd
    class="text-sm pl-0 mb-4 text-gray-medium h-8 flex flex-wrap items-center"
  >
    <div
      v-if="withEllipsis"
      class="truncate"
    >
      <slot />
    </div>
    <slot v-else />
  </dd>
</template>

<script setup lang="ts">
type Props = {
  withEllipsis?: boolean
}

withDefaults(defineProps<Props>(), {
  withEllipsis: true,
})
</script>
