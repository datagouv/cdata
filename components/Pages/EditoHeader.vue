<template>
  <div
    class="py-16"
    :class="bgColor"
  >
    <div class="container space-y-5">
      <div class="space-y-2">
        <div class="flex flex-col-reverse sm:flex-row gap-5 items-start sm:items-center sm:justify-between">
          <h1 class="text-white font-extrabold text-5xl mb-0">
            {{ title }}
          </h1>
          <CdataLink
            class="bg-[#0D0C4F]/20 hover:bg-[#0D0C4F]/30 fr-raw-link text-white font-medium text-lg px-5 py-3 rounded-4xl flex justify-start items-start sm:items-center gap-2"
            :href="linkUrl"
          >
            <RiInformation2Line
              class="size-6"
              aria-hidden="true"
            />
            <span>{{ linkLabel }}</span>
          </CdataLink>
        </div>
      </div>
      <form @submit.prevent="onSubmit">
        <label
          :for="id"
          class="italic font-spectral text-2xl text-white"
        >
          {{ subtitle }}
        </label>
        <div class="w-full flex rounded-t overflow-hidden">
          <input
            :id="id"
            v-model="query"
            class="w-full text-2xl bg-white/80 border-b-4 border-white px-4 text-black placeholder:text-gray-plain"
            :placeholder
          >
          <button
            class="shrink-0 size-20 bg-white flex items-center justify-center"
            :title="$t('Rechercher')"
          >
            <RiSearchLine
              class="size-10"
              :class="textColor"
              aria-hidden="true"
            />
          </button>
        </div>
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

const id = useId()

const bgColor = computed(() => ({
  primary: 'bg-new-blue-illustration',
  green: 'bg-new-green-illustration',
  purple: 'bg-new-brown-illustration',
}[props.color]))

const textColor = computed(() => ({
  primary: 'text-new-blue-illustration',
  green: 'text-new-green-illustration',
  purple: 'text-new-brown-illustration',
}[props.color]))

const query = ref('')

function onSubmit() {
  navigateTo({
    path: props.searchUrl,
    query: query.value ? { q: query.value } : undefined,
  })
}
</script>
