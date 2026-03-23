<template>
  <div
    ref="parent"
    @focusin="openIfClosed"
    @focusout="focusout"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  accordion: string | undefined
}>()

const emit = defineEmits<{
  blur: []
}>()

const parentRef = useTemplateRef('parent')

const openIfClosed = () => {
  if (props.accordion) {
    const button = document.querySelector<HTMLButtonElement>(`[aria-controls=${props.accordion}]`)
    if (button && button.ariaExpanded !== 'true') {
      button.click()
    }
  }
}

const focusout = (event: FocusEvent) => {
  const target = event.relatedTarget as HTMLElement | null
  if (!parentRef.value?.contains(target)) {
    emit('blur')
  }
}
</script>
