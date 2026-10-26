<template>
  <NuxtLink
    :rel="rel"
    v-bind="attrs"
    :to="to"
    :href="href as string"
    @click="$emit('click')"
  ><slot /></NuxtLink>
</template>

<script setup lang="ts">
import { followLinksKey } from '@datagouv/components-next'
import type { NuxtLinkProps } from '#app'

const props = defineProps<Pick<NuxtLinkProps, 'to' | 'href' | 'external'>>()
const attrs = useAttrs()
defineEmits<{
  click: []
}>()

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

// Followed by default: a link written in the code is chosen by the team. Containers rendering
// links from the API say otherwise, see followLinksKey. Links to the site itself were made
// relative above.
const followLinks = inject(followLinksKey, true)
const rel = computed(() => {
  const link = href.value ?? to.value
  return !followLinks && typeof link === 'string' && /^([a-z][a-z\d+.-]*:|\/\/)/i.test(link) ? 'ugc nofollow noopener noreferrer' : undefined
})
</script>
