<template>
  <ActivityList :user="user.id" />
</template>

<script setup lang="ts">
import type { User } from '@datagouv/components-next'
import ActivityList from '~/components/ActivityList.vue'

defineProps<{ user: User }>()
</script>
