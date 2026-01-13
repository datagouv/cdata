<template>
  <!-- @keydown.space.stop prevents DisclosureButton (Headless UI) from toggling the accordion when typing spaces -->
  <component
    :is="tag"
    :contenteditable="true"
    role="textbox"
    :aria-multiline="tag !== 'span'"
    :class="['outline-none focus:ring-2 focus:ring-blue-300 rounded-sm cursor-text', { 'whitespace-pre-wrap': tag !== 'span' }, !modelValue && placeholder && 'text-gray-400']"
    @blur="onBlur"
    @focus="onFocus"
    @keydown.enter="onEnter"
    @keydown.space.stop
  >
    {{ modelValue || placeholder }}
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  tag?: 'div' | 'p' | 'span'
  placeholder?: string
}>(), {
  tag: 'div',
})

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

function onFocus(e: FocusEvent) {
  const target = e.target as HTMLElement
  // Clear placeholder text when focusing on empty field
  if (!props.modelValue && props.placeholder) {
    target.textContent = ''
  }
}

function onBlur(e: FocusEvent) {
  const target = e.target as HTMLElement
  const newValue = target.textContent || ''
  // Restore placeholder if empty
  if (!newValue && props.placeholder) {
    target.textContent = props.placeholder
  }
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
