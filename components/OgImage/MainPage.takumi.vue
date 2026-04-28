<script setup lang="ts">
const props = defineProps<{
  title: string
  uri: string
}>()

const path = computed(() => props.uri.replace(/^\/+/, ''))
const { isProduction } = useRuntimeConfig().public
</script>

<template>
  <div class="flex flex-col justify-between w-full h-full bg-white p-12">
    <div class="flex items-start">
      <img
        src="/nuxt_images/logo_horizontal.svg"
        alt=""
        class="w-80 h-[calc(var(--spacing)*80*113/433)]"
      >
      <div
        v-if="! isProduction"
        class="ml-auto self-start text-4xl py-2 px-4 uppercase tracking-wide bg-[#FFE9E6] text-[#B34000] font-extrabold"
        style="font-family: 'Marianne'"
      >
        Version de test
      </div>
    </div>
    <div class="gap-[12px] flex flex-col">
      <h1
        :class="title.length > 16 ? 'text-[80px]' : 'text-[120px]'"
        class="font-extrabold text-[#161616]"
        style="font-family: 'Marianne'; line-clamp: 2; text-overflow: ellipsis;"
      >
        {{ title }}
      </h1>
      <div
        style="font-family: 'Inconsolata'"
        class="font-light text-6xl"
      >
        <span class="text-[#000091]">data.gouv.fr/</span><span class="text-[#272747]">{{ path }}</span>
      </div>
    </div>
  </div>
</template>
