<template>
  <NuxtLink
    v-bind="{ ...attrs, to, href }"
  ><slot /></NuxtLink>
</template>

<script setup lang="ts">
import type { NuxtLinkProps } from '#app'

const props = defineProps<Pick<NuxtLinkProps, 'to' | 'href' | 'external'>>()
const attrs = useAttrs()

const absoluteUrlToRelative = useAbsoluteUrlToRelative()

const to = computed(() => {
  if (!props.to) return props.to
  if (props.external) return props.to
  if (typeof props.to !== 'string') return props.to
  return absoluteUrlToRelative(props.to)
})
const href = computed(() => {
  if (!props.href) return props.href
  if (props.external) return props.href
  if (typeof props.href !== 'string') return props.href
  return absoluteUrlToRelative(props.href)
})
</script>
