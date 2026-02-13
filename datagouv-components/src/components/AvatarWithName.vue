<template>
  <span class="inline-flex items-center space-x-1">
    <Avatar
      v-bind="$attrs"
      :user="user"
      :size
      :rounded="true"
    />
    <component
      :is="withLink ? AppLink : 'span'"
      :to="withLink ? user.page : undefined"
      class="truncate"
      :class="{ 'font-bold': withLink }"
    >
      {{ user.first_name }}
      {{ user.last_name }}
    </component>
  </span>
</template>

<script setup lang="ts">
import type { User, UserReference } from '../types/users'
import AppLink from './AppLink.vue'
import Avatar from './Avatar.vue'

withDefaults(defineProps<{
  user: User | UserReference
  size?: number
  withLink?: boolean
}>(), {
  size: 12,
  withLink: true,
})
</script>
