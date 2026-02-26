<script setup lang="ts">
const props = defineProps<{
  title: string
  uri: string
}>()

const uri = computed(() => props.uri.replace(/^\/+/, ''))
</script>

<template>
  <div class="flex flex-col justify-between w-full h-full bg-white p-12">
    <img
      src="/nuxt_images/logo_horizontal.svg"
      alt=""
      class="w-80 aspect-[433/113]"
    >
    <div class="gap-[12px] flex flex-col">
      <h1
        class="text-[120px] font-extrabold text-[#161616]"
        style="font-family: 'Marianne'"
      >
        {{ title }}
      </h1>
      <div
        style="font-family: 'Inconsolata';"
        class="font-light text-6xl"
      >
        <span class="text-[#9FC3FC]">data.gouv.fr/</span><span class="text-[#272747]">{{ uri }}</span>
      </div>
    </div>
  </div>
</template>
