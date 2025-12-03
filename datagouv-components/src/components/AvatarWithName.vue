<template>
  <span class="inline-flex items-center space-x-1">
    <Avatar
      v-bind="$attrs"
      :user="user"
      :size
      :rounded="true"
    />
    <AppLink
      :to="user.page"
      class="fr-text--bold"
    >
      {{ user.first_name }}
      {{ user.last_name }}
    </AppLink>
  </span>
</template>

<script setup lang="ts">
import type { User } from '../types/users'
import AppLink from './AppLink.vue'
import Avatar from './Avatar.vue'

withDefaults(defineProps<{
  user: User
  size?: number
}>(), {
  size: 12,
})
</script>
