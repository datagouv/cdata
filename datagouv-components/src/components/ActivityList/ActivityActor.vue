<template>
  <AvatarWithName
    v-if="actor.class === 'User'"
    :user="actor"
    :size
    :with-link
  />
  <span
    v-else
    class="inline-flex items-center space-x-1"
  >
    <span
      class="inline-flex flex-none items-center justify-center rounded-full border border-gray-default text-gray-medium"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <RiRobot2Line
        :size="String(Math.round(size * 0.6))"
        aria-hidden="true"
      />
    </span>
    <span class="truncate font-bold">{{ actor.name }}</span>
  </span>
</template>

<script setup lang="ts">
import { RiRobot2Line } from '@remixicon/vue'
import type { ActivityActor } from '../../types/activity'
import AvatarWithName from '../AvatarWithName.vue'

withDefaults(defineProps<{
  actor: ActivityActor
  size?: number
  withLink?: boolean
}>(), {
  size: 12,
  withLink: true,
})
</script>
