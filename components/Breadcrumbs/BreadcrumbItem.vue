<template>
  <li
    data-breadcrumb-item
    :data-breadcrumb-to="to"
  >
    <a
      v-if="isCurrent"
      class="fr-breadcrumb__link"
      aria-current="page"
    >
      <slot />
    </a>
    <CdataLink
      v-else
      class="fr-breadcrumb__link"
      :to
    >
      <slot />
    </CdataLink>
  </li>
</template>

<script setup lang="ts">
const props = defineProps<{
  to?: string
}>()

const isCurrentUrl = useIsCurrentUrl()
const isCurrent = computed(() => !props.to || isCurrentUrl(props.to))
</script>
