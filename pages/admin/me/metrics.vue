<template>
  <MetricsAdminPage :user="me" />
</template>

<script setup lang="ts">
import { keepScrollWithinPage } from '~/utils/scroll'

definePageMeta({
  scrollToTop: keepScrollWithinPage,
})

const me = useMe()
</script>
