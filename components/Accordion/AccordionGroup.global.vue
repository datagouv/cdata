<template>
  <component
    :is="as"
    class="fr-accordions-group"
  >
    <slot ref="" />
  </component>
</template>

<script setup lang="ts">
import { key } from '~/components/Accordion/injectionKey'

withDefaults(defineProps<{
  as?: string
}>(), {
  as: 'div',
})

const emit = defineEmits<{
  open: [id: string]
}>()

const opened = ref<string | null>(null)

provide(key, {
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
