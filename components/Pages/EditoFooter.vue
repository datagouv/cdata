<template>
  <div
    class="py-16"
    :class="bgColor"
  >
    <div class="mx-auto max-w-xl flex flex-col items-center">
      <p class="text-white font-extrabold text-center text-4xl">
        {{ $t(`Vous n'avez pas trouvé ce que vous cherchez ?`) }}
      </p>
      <BrandedButton
        color="white-flat"
        size="lg"
        :href="searchUrl"
        :class="textColor"
      >
        {{ searchLabel }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'

const props = defineProps<{
  color: 'primary' | 'green' | 'purple'
  searchUrl: string
  searchLabel: string
}>()

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
</script>
