<template>
  <SimpleBanner
    v-if="field.toLowerCase().split(' ').includes('test')"
    type="primary"
    class="flex items-center space-x-2"
  >
    <RiInformationLine class="shink-0 size-6" />
    <p class="w-full mb-0">
      <i18n-t
        keypath="If you want to do tests, use {demo_server}."
        scope="global"
      >
        <template #demo_server>
          <a :href="config.public.demoServer.url">{{ config.public.demoServer.name }}</a>
        </template>
      </i18n-t>
    </p>
  </SimpleBanner>
</template>

<script setup lang="ts">
import { SimpleBanner } from '@datagouv/components-next'
import { RiInformationLine } from '@remixicon/vue'

defineProps<{ field: string }>()

const config = useRuntimeConfig()
</script>
