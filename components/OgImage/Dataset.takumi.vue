<script setup lang="ts">
import { RiEyeLine, RiDownloadLine, RiLineChartLine, RiStarLine } from '@remixicon/vue'
import { summarize } from '@datagouv/components-next'
import Mariane from '../Mariane.vue'
import LogoImageRaw from '../LogoImageRaw.vue'

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
  <div class="flex flex-col w-full h-full bg-white p-12">
    <div class="flex items-center justify-between w-full">
      <LogoImageRaw
        is-french-government
        class="h-14 w-44"
      />
      <Mariane class="h-10 w-24" />
    </div>

    <!-- Content: org + title -->
    <div class="flex flex-col flex-1 justify-end">
      <div
        v-if="orgLogo"
        class="flex items-center justify-center rounded-lg border border-gray-200 mb-4 size-25 p-2.5"
      >
        <img
          :src="orgLogo"
          class="max-w-20 max-h-20 object-contain"
        >
      </div>
      <p
        v-if="orgName"
        class="text-[32px] font-bold mb-2 text-[#000091]"
        style="font-family: 'MarianneBold'"
      >
        {{ orgName }}
      </p>
      <h1
        class="text-[60px] font-medium leading-tight overflow-hidden text-[#161616]"
        style="font-family: 'MarianneMedium'; line-clamp: 2; text-overflow: ellipsis;"
      >
        {{ title }}
      </h1>
    </div>

    <!-- Footer: metrics (SVG paths from @remixicon/vue) -->
    <div class="flex items-center gap-[32px] mt-6">
      <div class="flex items-center gap-[4px]">
        <RiEyeLine
          size="32"
          color="#000091"
        />
        <span
          class="text-[24px] font-bold text-[#000091]"
          style="font-family: 'MarianneBold'"
        >{{ summarize(views) }}</span>
      </div>
      <div class="flex items-center gap-[4px]">
        <RiDownloadLine
          size="32"
          color="#000091"
        />
        <span
          class="text-[24px] font-bold text-[#000091]"
          style="font-family: 'MarianneBold'"
        >{{ summarize(downloads) }}</span>
      </div>
      <div class="flex items-center gap-[4px]">
        <RiLineChartLine
          size="32"
          color="#000091"
        />
        <span
          class="text-[24px] font-bold text-[#000091]"
          style="font-family: 'MarianneBold'"
        >{{ summarize(reuses) }}</span>
      </div>
      <div class="flex items-center gap-[4px]">
        <RiStarLine
          size="32"
          color="#000091"
        />
        <span
          class="text-[24px] font-bold text-[#000091]"
          style="font-family: 'MarianneBold'"
        >{{ summarize(followers) }}</span>
      </div>
    </div>
  </div>
</template>
