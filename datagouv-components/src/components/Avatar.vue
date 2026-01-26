<template>
  <img
    :class="{ 'rounded-full border border-gray-default': rounded }"
    :src="avatarUrl"
    :width="size"
    :height="size"
    loading="lazy"
    alt=""
    data-testid="user-avatar"
  >
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGetUserAvatar } from '../functions/users'
import type { User, UserReference } from '../types/users'

type Props = {
  rounded?: boolean
  size?: number
  user: User | UserReference
}
const props = withDefaults(defineProps<Props>(), {
  rounded: false,
  size: 40,
})
const getUserAvatar = useGetUserAvatar()
const avatarUrl = computed(() => getUserAvatar(props.user, props.size))
</script>
