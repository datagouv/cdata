<template>
  <ActivityList :user="user.id" />
</template>

<script setup lang="ts">
import { ActivityList, type User } from '@datagouv/components-next'

defineProps<{ user: User }>()
</script>
