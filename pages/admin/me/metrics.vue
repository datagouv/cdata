<template>
  <MetricsAdminPage :user="me" />
</template>

<script setup lang="ts">
import { keepScrollBetweenTabs } from '~/utils/scroll'

definePageMeta({
  scrollToTop: keepScrollBetweenTabs,
})

const me = useMe()
</script>
