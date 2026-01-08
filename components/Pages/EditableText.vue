<template>
  <component
    :is="tag"
    :contenteditable="true"
    :class="['outline-none focus:ring-2 focus:ring-blue-300 rounded-sm cursor-text', { 'whitespace-pre-wrap': tag !== 'span' }]"
    @blur="onBlur"
    @keydown.enter="onEnter"
  >
    {{ modelValue }}
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  tag?: 'div' | 'p' | 'span'
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

// For spans (titles, links), Enter confirms the edit instead of inserting a line break.
// div/p keep the default behavior to allow multi-line text.
function onEnter(e: KeyboardEvent) {
  if (props.tag === 'span') {
    e.preventDefault()
    ;(e.target as HTMLElement).blur()
  }
}
</script>
