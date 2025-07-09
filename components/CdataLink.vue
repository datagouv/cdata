<template>
  <NuxtLink
    :to
  ><slot /></NuxtLink>
</template>

<script setup lang="ts">
import type { NuxtLinkProps } from '#app'

const props = defineProps<NuxtLinkProps>()

const absoluteUrlToRelative = useAbsoluteUrlToRelative()

const to = computed(() => {
  if (typeof props.to !== 'string') return props.to
  return absoluteUrlToRelative(props.to)
})
</script>
