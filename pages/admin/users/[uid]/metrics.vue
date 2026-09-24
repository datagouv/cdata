<template>
  <MetricsAdminPage :user />
</template>

<script setup lang="ts">
import { keepScrollWithinPage } from '~/utils/scroll'

definePageMeta({
  scrollToTop: keepScrollWithinPage,
})

const { currentUser: user } = useCurrentOwned()
</script>
