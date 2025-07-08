<template>
  <NuxtLink
    v-bind="{ ...props, to }"
  ><slot /></NuxtLink>
</template>

<script setup lang="ts">
import type { NuxtLinkProps } from '#app'

const props = defineProps<NuxtLinkProps>()

const currentUrl = useRequestURL()

const to = computed(() => {
  if (typeof props.to !== 'string') return props.to

  try {
    const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`

    if (!props.to.startsWith(baseUrl)) return props.to
    return props.to.slice(baseUrl.length)
  }
  catch {
    // Ce n’est pas une URL absolue, on retourne tel quel
  }

  return props.to
})
</script>
