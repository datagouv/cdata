<template>
  <div class="flex items-center justify-end gap-2">
    <meter
      class="percentage-meter w-20 h-2 appearance-none"
      min="0"
      max="100"
      :value="value"
      :title="label"
    />
    <span class="text-xs tabular-nums">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  value: number
}>()

const label = computed(() => `${props.value.toFixed(1)}%`)
</script>

<style scoped>
.percentage-meter {
  background: var(--color-gray-lower);
  border: 1px solid var(--color-gray-default);
  border-radius: 9999px;
}

.percentage-meter::-webkit-meter-bar {
  background: var(--color-gray-lower);
  border-radius: 9999px;
  border: none;
}

.percentage-meter::-webkit-meter-optimum-value,
.percentage-meter::-webkit-meter-suboptimum-value,
.percentage-meter::-webkit-meter-even-less-good-value {
  background: var(--color-gray-silver);
  border-radius: 9999px;
}

.percentage-meter::-moz-meter-bar {
  background: var(--color-gray-silver);
  border-radius: 9999px;
}
</style>
