<template>
  <component
    :is="as"
    class="fr-accordions-group"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { key } from '~/components/Accordion/injectionKey'

const props = withDefaults(defineProps<{
  as?: string
  withIcon?: boolean
}>(), {
  as: 'div',
})

const emit = defineEmits<{
  open: [id: string]
}>()

const opened = ref<string | null>(null)

provide(key, {
  withIcon: props.withIcon,
  isOpen(id: string) {
    return opened.value === id
  },

  open(id: string) {
    opened.value = id
  },

  toggle(id: string) {
    if (opened.value === id) {
      opened.value = null
    }
    else {
      opened.value = id
      emit('open', id)
    }
  },

  unregister(id: string) {
    if (opened.value === id) {
      opened.value = null
    }
  },
})
</script>
