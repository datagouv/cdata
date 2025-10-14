<template>
  <UserActivityList :user="user.id" />
</template>

<script setup lang="ts">
import { UserActivityList, type User } from '@datagouv/components-next'

defineProps<{ user: User }>()
</script>
