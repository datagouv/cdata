<template>
  <component
    :is="config?.appLink"
    v-if="config.appLink"
    :to
  >
    <slot />
  </component>
  <a
    v-else-if="isExternal"
    :href="(to as string)"
  >
    <slot />
  </a>
  <RouterLink
    v-else
    :to
  ><slot /></RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'
import { useComponentsConfig } from '../config'
import { useTranslation } from '../composables/useTranslation'

const config = useComponentsConfig()
const { locale } = useTranslation()

const props = defineProps<{
  to: string | RouteLocationRaw
}>()

const isExternal = computed(() => {
  if (typeof props.to !== 'string') return false
  return props.to && props.to.startsWith('http')
})
const to = computed(() => {
  // If the `appLink` component is override, the override is responsible of the locale management
  if (config.appLink) return props.to

  // If it's an external link, no locale management needed.
  if (isExternal.value) return props.to

  // TODO harden this for path not starting with "/"x
  if (typeof props.to === 'string') return `/${locale}${props.to}`

  return props.to
})
</script>
