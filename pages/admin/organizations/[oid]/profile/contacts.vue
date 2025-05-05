<template>
  <AdminContactPointsPage :organization />
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'
import AdminContactPointsPage from '~/components/Organization/AdminContactPointsPage.vue'

defineProps<{ organization: Organization }>()
</script>
