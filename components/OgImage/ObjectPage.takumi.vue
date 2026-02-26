<script setup lang="ts">
import { RiEyeLine, RiDownloadLine, RiLineChartLine, RiStarLine } from '@remixicon/vue'
import { summarize } from '@datagouv/components-next'

const {
  title = 'Titre du jeu de données',
  orgName = null,
  orgLogo = null,
  views = 0,
  downloads = 0,
  reuses = 0,
  followers = 0,
} = defineProps<{
  title?: string
  orgName?: string | null
  orgLogo?: string | null
  views?: number
  downloads?: number
  reuses?: number
  followers?: number
}>()
</script>

<template>
  <div
    class="flex flex-col justify-between w-full h-full bg-white p-12"
    style="font-family: 'Marianne'"
  >
    <img
      src="/nuxt_images/logo_horizontal.svg"
      alt=""
      class="w-40 aspect-[433/113]"
    >
    <div class="gap-[12px] flex flex-col">
      <div
        v-if="orgLogo"
        class="flex items-center justify-center rounded-lg border border-gray-200 size-25 p-2.5"
      >
        <img
          :src="orgLogo"
          class="max-w-20 max-h-20 object-contain"
        >
      </div>
      <p
        v-if="orgName"
        class="text-5xl font-extrabold text-[#161616]"
      >
        {{ orgName }}
      </p>
      <h1
        class="text-6xl font-light leading-tight overflow-hidden text-[#161616]"
        style="line-clamp: 2; text-overflow: ellipsis;"
      >
        {{ title }}
      </h1>
      <div class="flex items-center gap-[32px] mt-6">
        <div class="flex items-center gap-[8px]">
          <span class="text-4xl font-light text-[#666666]">{{ summarize(views) }}</span>
          <RiEyeLine
            class="size-10"
            color="#666666"
          />
        </div>
        <div class="flex items-center gap-[8px]">
          <span class="text-4xl font-light text-[#666666]">{{ summarize(downloads) }}</span>
          <RiDownloadLine
            class="size-10"
            color="#666666"
          />
        </div>
        <div class="flex items-center gap-[8px]">
          <span class="text-4xl font-light text-[#666666]">{{ summarize(reuses) }}</span>
          <RiLineChartLine
            class="size-10"
            color="#666666"
          />
        </div>
        <div class="flex items-center gap-[8px]">
          <span class="text-4xl font-light text-[#666666]">{{ summarize(followers) }}</span>
          <RiStarLine
            class="size-10"
            color="#666666"
          />
        </div>
      </div>
    </div>
  </div>
</template>
