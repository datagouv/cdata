<template>
  <div class="flex items-center justify-end gap-2">
    <meter
      class="percentage-meter w-20 h-2 appearance-none"
      min="0"
      max="100"
      :value="safeValue"
      :title="label"
    />
    <span class="text-xs tabular-nums">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  value?: number | null
}>(), { value: 0 })

const safeValue = computed(() => {
  const num = Number(props.value ?? 0)
  return Number.isFinite(num) ? num : 0
})

const label = computed(() => `${safeValue.value.toFixed(1)}%`)
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
