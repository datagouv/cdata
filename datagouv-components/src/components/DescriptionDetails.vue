<template>
  <dd
    class="m-0 p-0 min-w-0 text-sm/5 font-normal text-gray-title [overflow-wrap:anywhere]"
  >
    <div
      v-if="withEllipsis"
      class="truncate min-w-0"
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
