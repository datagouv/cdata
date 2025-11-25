<template>
  <NuxtLink
    v-bind="{ ...filteredProps, to, href }"
  ><slot /></NuxtLink>
</template>

<script setup lang="ts">
import type { NuxtLinkProps } from '#app'

const props = defineProps<NuxtLinkProps>()

const absoluteUrlToRelative = useAbsoluteUrlToRelative()

const filteredProps = computed(() => {
  // Si prefetch et noPrefetch sont tous les deux définis, on ignore noPrefetch
  if (props.prefetch !== undefined && props.noPrefetch !== undefined) {
    const { noPrefetch, ...rest } = props
    return rest
  }
  return props
})

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
