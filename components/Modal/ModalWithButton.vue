<template>
  <slot
    name="button"
    :attrs="{
      'aria-controls': id,
      'type': 'button' as any,
    }"
    :listeners="{
      click: open,
    }"

    :close
  />
  <ModalClient
    :modal-id="id"
    class="fr-header__search"
    :opened="isOpen"
    :title
    :show-title
    :size
    v-bind="$attrs"
    :form
    @close="close"
    @submit="$emit('submit', $event, close)"
  >
    <template #iconTitle>
      <slot name="iconTitle" />
    </template>
    <slot :close />
    <template #footer>
      <slot
        name="footer"
        :close
      />
    </template>
  </ModalClient>
</template>

<script setup lang="ts">
import ModalClient from './Modal.client.vue'

const id = useId() as string

withDefaults(defineProps<{
  title: string
  showTitle?: boolean
  size?: 'sm' | 'md' | 'lg' | 'fullscreen'
  form?: boolean
}>(), {
  showTitle: true,
  size: 'md',
  form: false,
})
const emits = defineEmits<{
  (e: 'open' | 'close'): void
  (name: 'submit', e: SubmitEvent, close: () => void): void
}>()
const isOpen = defineModel<boolean>()

const open = () => {
  isOpen.value = true
  emits('open')
}

const close = () => {
  isOpen.value = false
  emits('close')
}
</script>
