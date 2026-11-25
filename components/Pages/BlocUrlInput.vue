<template>
  <!-- A URL is required: emptying it keeps the previous one, the bloc is deleted instead. -->
  <input
    :value="url"
    type="text"
    class="block text-sm text-gray-title placeholder:text-gray-500 bg-white border rounded px-2 py-1 w-full"
    :placeholder="label"
    :aria-label="label"
    @change="change"
  >
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()

const url = defineModel<string>({ required: true })

function change(event: Event) {
  const input = event.target as HTMLInputElement
  url.value = input.value.trim() || url.value
  input.value = url.value
}
</script>
