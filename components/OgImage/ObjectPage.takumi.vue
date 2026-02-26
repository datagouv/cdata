<script setup lang="ts">
import { RiEyeLine, RiDownloadLine, RiLineChartLine, RiStarLine, RiDatabase2Line, RiTerminalLine } from '@remixicon/vue'
import { summarize } from '@datagouv/components-next'

const {
  objectTitle,
  orgName = null,
  orgLogo = null,
  ownerName = null,
  ownerAvatar = null,
  datasets,
  dataservices,
  views,
  downloads,
  reuses,
  followers,
} = defineProps<{
  objectTitle?: string
  orgName?: string | null
  orgLogo?: string | null
  ownerName?: string | null
  ownerAvatar?: string | null
  datasets?: number
  dataservices?: number
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
        class="flex items-center justify-center rounded-lg border border-gray-200 size-25 p-2.5 mb-3"
      >
        <img
          :src="orgLogo"
          class="size-25 object-contain"
        >
      </div>
      <div
        v-else-if="ownerAvatar"
        class="size-25 rounded-full overflow-hidden mb-3"
      >
        <img
          :src="ownerAvatar"
          class="size-25 object-cover"
        >
      </div>
      <p
        v-if="orgName || ownerName"
        :class="objectTitle ? 'text-4xl' : 'text-[60px]'"
        class="font-extrabold text-[#161616] leading-tight text-balance"
        style="line-clamp: 2; text-overflow: ellipsis; overflow: hidden"
      >
        {{ orgName || ownerName }}
      </p>
      <h1
        v-if="objectTitle"
        class="text-6xl font-light text-[#161616] leading-tight text-balance mb-3"
        style="line-clamp: 2; text-overflow: ellipsis; overflow: hidden"
      >
        {{ objectTitle }}
      </h1>
      <div class="flex items-center gap-[32px]">
        <div
          v-if="datasets !== undefined"
          class="flex items-center gap-[8px]"
        >
          <span class="text-4xl font-normal text-[#666666]">{{ summarize(datasets) }}</span>
          <RiDatabase2Line
            class="size-10"
            color="#666666"
          />
        </div>
        <div
          v-if="dataservices !== undefined"
          class="flex items-center gap-[8px]"
        >
          <span class="text-4xl font-normal text-[#666666]">{{ summarize(dataservices) }}</span>
          <RiTerminalLine
            class="size-10"
            color="#666666"
          />
        </div>
        <div
          v-if="views !== undefined"
          class="flex items-center gap-[8px]"
        >
          <span class="text-4xl font-normal text-[#666666]">{{ summarize(views) }}</span>
          <RiEyeLine
            class="size-10"
            color="#666666"
          />
        </div>
        <div
          v-if="downloads !== undefined"
          class="flex items-center gap-[8px]"
        >
          <span
            class="text-4xl font-normal text-[#666666]"
          >{{ summarize(downloads) }}</span>
          <RiDownloadLine
            class="size-10"
            color="#666666"
          />
        </div>
        <div
          v-if="reuses !== undefined"
          class="flex items-center gap-[8px]"
        >
          <span class="text-4xl font-normal text-[#666666]">{{ summarize(reuses) }}</span>
          <RiLineChartLine
            class="size-10"
            color="#666666"
          />
        </div>
        <div
          v-if="followers !== undefined"
          class="flex items-center gap-[8px]"
        >
          <span class="text-4xl font-normal text-[#666666]">{{ summarize(followers) }}</span>
          <RiStarLine
            class="size-10"
            color="#666666"
          />
        </div>
      </div>
    </div>
  </div>
</template>
