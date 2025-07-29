<template>
  <div
    class="py-16"
    :class="bgColor"
  >
    <div class="container space-y-5">
      <div class="space-y-2">
        <div class="flex flex-col-reverse sm:flex-row gap-5 sm:items-center sm:justify-between">
          <h1 class="text-white font-extrabold text-5xl mb-0">
            {{ title }}
          </h1>
          <CdataLink
            class="bg-[#0D0C4F]/20 fr-raw-link text-white font-medium text-lg px-5 py-3 rounded-4xl flex items-center gap-2"
            :href="linkUrl"
          >
            <RiInformation2Line class="size-6" />
            <span>{{ linkLabel }}</span>
          </CdataLink>
        </div>
        <div class="italic font-spectral text-2xl text-white">
          {{ subtitle }}
        </div>
      </div>
      <form
        method="GET"
        :action="searchUrl"
        class="w-full flex rounded-t overflow-hidden"
      >
        <input
          name="q"
          class="w-full text-2xl bg-white/80 border-b-4 border-white px-4 text-black placeholder:text-gray-plain"
          :placeholder
        >
        <button class="shrink-0 size-20 bg-white flex items-center justify-center">
          <RiSearchLine
            class="size-10"
            :class="textColor"
          />
        </button>
      </form>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RiInformation2Line, RiSearchLine } from '@remixicon/vue'

const props = defineProps<{
  color: 'primary' | 'green' | 'purple'
  title: string
  subtitle: string
  placeholder: string
  searchUrl: string
  linkLabel: string
  linkUrl: string
}>()

const bgColor = computed(() => ({
  primary: 'bg-primary',
  green: 'bg-green-reuse',
  purple: 'bg-purple-dataservice',
}[props.color]))

const textColor = computed(() => ({
  primary: 'text-primary',
  green: 'text-green-reuse',
  purple: 'text-purple-dataservice',
}[props.color]))
</script>
