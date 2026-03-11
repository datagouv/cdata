<script setup lang="ts">
const { isProduction } = useRuntimeConfig().public
</script>

<template>
  <div class="flex flex-col justify-end w-full h-full bg-white p-12 gap-[24px]">
    <div
      v-if="! isProduction"
      class="self-start text-4xl py-2 px-4 uppercase tracking-wide bg-[#FFE9E6] text-[#B34000] font-extrabold"
      style="font-family: 'MarianneExtraBold'"
    >
      Version de test
    </div>
    <img
      src="/nuxt_images/logo_horizontal.svg"
      alt=""
      class="w-96 h-[calc(var(--spacing)*96*113/433)]"
    >
    <h1
      class="text-7xl/tight font-light text-[#161616]"
      style="font-family: 'MarianneLight'"
    >
      La plateforme des données publiques françaises
    </h1>
  </div>
</template>
