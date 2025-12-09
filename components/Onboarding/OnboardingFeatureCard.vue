<template>
  <div class="border border-gray-default rounded bg-white flex flex-col h-full overflow-hidden">
    <!-- Grande carte : image 320px + padding 60px top/bottom -->
    <div
      v-if="image && size === 'large'"
      class="rounded-t overflow-hidden flex items-center justify-center py-8 md:py-[60px] px-4 bg-gradient-to-b"
      :class="gradientClass"
    >
      <NuxtImg
        :src="image"
        :alt="imageAlt || ''"
        class="h-[240px] md:h-[320px] w-auto object-contain"
        loading="lazy"
      />
    </div>
    <!-- Petite carte : container = padding top 30px + image -->
    <div
      v-if="image && size === 'small'"
      class="rounded-t overflow-hidden min-h-[190px] md:min-h-[240px] pl-5 md:pl-[30px] flex items-end justify-end bg-gradient-to-b"
      :class="gradientClass"
    >
      <NuxtImg
        :src="image"
        :alt="imageAlt || ''"
        class="w-[260px] md:w-[348px] h-auto object-contain object-right-bottom mt-5 md:mt-[30px]"
        loading="lazy"
      />
    </div>
    <div class="p-4 flex flex-col flex-1">
      <h3 class="text-lg font-bold leading-normal text-[#161616] mb-2">
        {{ title }}
      </h3>
      <p class="text-lg font-normal leading-normal text-[#3C4043] flex-1 mb-0">
        {{ description }}
      </p>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  description: string
  image?: string
  imageAlt?: string
  size?: 'large' | 'small'
  color?: 'blue' | 'green'
}>(), {
  size: 'small',
  color: 'blue',
})

const gradientClass = computed(() => ({
  blue: 'from-new-blue-illustration-light from-50% to-[#F6F6F6]',
  green: 'from-new-green-illustration-light from-50% to-white',
}[props.color]))
</script>
