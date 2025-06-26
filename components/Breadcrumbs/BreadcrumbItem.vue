<template>
  <li
    data-breadcrumb-item
    :data-breadcrumb-to="vers"
  >
    <a
      v-if="isCurrent"
      class="fr-breadcrumb__link"
      aria-current="page"
    >
      <slot />
    </a>
    <NuxtLinkLocale
      v-else
      class="fr-breadcrumb__link"
      :to
      :external
    >
      <slot />
    </NuxtLinkLocale>
  </li>
</template>

<script setup lang="ts">
const props = defineProps<{
  to?: string
  external?: boolean
}>()

const route = useRoute()
const localePath = useLocalePath()

const isCurrent = computed(() => !props.to || localePath(props.to) === route.fullPath)
</script>
