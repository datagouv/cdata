<template>
  <section class="grid gap-6 py-8">
    <component
      :is="titleTag"
      class="m-0 text-sm/5 font-medium uppercase text-gray-title"
    >
      <slot name="title">
        {{ title }}
      </slot>
    </component>
    <slot />
  </section>
</template>

<script setup lang="ts">
import type { TitleTag } from '../../types/ui'

withDefaults(defineProps<{
  title: string
  titleTag?: TitleTag
}>(), {
  titleTag: 'h3',
})
</script>
