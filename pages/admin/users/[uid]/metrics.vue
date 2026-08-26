<template>
  <MetricsAdminPage :user />
</template>

<script setup lang="ts">
import { keepScrollBetweenTabs } from '~/utils/scroll'

definePageMeta({
  scrollToTop: keepScrollBetweenTabs,
})

const { currentUser: user } = useCurrentOwned()
</script>
