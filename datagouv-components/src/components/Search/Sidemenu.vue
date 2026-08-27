<template>
  <nav :aria-labelledby="titleId">
    <button
      class="flex w-[calc(100%+2rem)] items-center justify-between -mx-4 px-4 py-3 font-bold md:hidden"
      :aria-expanded="open"
      @click="open = !open"
    >
      {{ buttonText }}
      <RiArrowDownSLine
        class="size-4 transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>
    <!-- Collapsing with CSS rather than `v-if` on a JS media query: the server has no
         viewport, so it always renders the desktop state and a narrow client would drop
         the whole panel during hydration. -->
    <div :class="{ 'hidden md:block': !open }">
      <p
        :id="titleId"
        class="text-sm font-bold leading-tight mb-6 hidden md:block"
      >
        <slot name="title" />
      </p>
      <slot />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import { RiArrowDownSLine } from '@remixicon/vue'

defineProps<{
  buttonText: string
}>()

const titleId = useId()
const open = ref(false)
</script>
