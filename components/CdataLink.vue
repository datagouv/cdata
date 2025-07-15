<template>
  <NuxtLink
    :to
    :href
  ><slot /></NuxtLink>
</template>

<script setup lang="ts">
import type { NuxtLinkProps } from '#app'

const props = defineProps<NuxtLinkProps>()

const absoluteUrlToRelative = useAbsoluteUrlToRelative()

const to = computed(() => {
  if (!props.to) return props.to
  if (typeof props.to !== 'string') return props.to
  return absoluteUrlToRelative(props.to)
})
const href = computed(() => {
  if (!props.href) return props.href
  if (typeof props.href !== 'string') return props.href
  return absoluteUrlToRelative(props.href)
})
</script>
