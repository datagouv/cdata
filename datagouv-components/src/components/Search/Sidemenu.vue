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
    <div v-if="open || !isMobile">
      <p
        :id="titleId"
        class="text-lg mb-6 font-bold hidden md:block"
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
import { useMediaQuery } from '@vueuse/core'

defineProps<{
  buttonText: string
}>()

const titleId = useId()
const isMobile = useMediaQuery('(max-width: 767px)')
const open = ref(false)
</script>
