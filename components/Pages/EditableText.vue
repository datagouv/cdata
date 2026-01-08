<template>
  <div
    v-if="tag === 'div'"
    :contenteditable="true"
    :class="[className, 'outline-none focus:ring-2 focus:ring-blue-300 rounded-sm cursor-text whitespace-pre-wrap']"
    @blur="onBlur"
  >
    {{ modelValue }}
  </div>
  <p
    v-else-if="tag === 'p'"
    :contenteditable="true"
    :class="[className, 'outline-none focus:ring-2 focus:ring-blue-300 rounded-sm cursor-text whitespace-pre-wrap']"
    @blur="onBlur"
  >
    {{ modelValue }}
  </p>
  <span
    v-else
    :contenteditable="true"
    :class="[className, 'outline-none focus:ring-2 focus:ring-blue-300 rounded-sm cursor-text']"
    @blur="onBlur"
    @keydown.enter.prevent="($event.target as HTMLElement).blur()"
  >
    {{ modelValue }}
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  tag?: string
  className?: string
}>(), {
  tag: 'div',
})

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

function onBlur(e: FocusEvent) {
  const target = e.target as HTMLElement
  const newValue = target.textContent || ''
  if (newValue !== props.modelValue) {
    emit('update:modelValue', newValue)
  }
}
</script>
