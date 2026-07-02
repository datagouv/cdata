<template>
  <LinkCard
    :to="to"
    class="flex flex-col md:flex-row gap-2.5 p-4"
  >
    <img
      :src="image"
      alt=""
      class="w-full md:w-[225px] md:h-[130px] object-cover object-left-bottom flex-shrink-0 border border-gray-default rounded-lg"
    >
    <div class="flex-1">
      <h3 class="font-bold text-base leading-normal mb-2">
        {{ title }}
      </h3>
      <p class="font-normal text-sm leading-normal">
        {{ description }}
      </p>
    </div>
  </LinkCard>
</template>

<script setup lang="ts">
import LinkCard from '~/components/LinkCard.vue'

defineProps<{
  title: string
  description: string
  to: string
  image: string
}>()
</script>
