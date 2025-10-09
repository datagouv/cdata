<template>
  <ActivityList :user>
    <template #activity="activity">
      {{ getActivityTranslation(activity) }}
      <slot :activity>
        <AppLink
          :to="activity.related_to_url"
          class="link flex w-full truncate"
          target="_blank"
        >
          <span
            class="truncate"
          >{{ activity.related_to }}</span>
        </AppLink>
      </slot>
    </template>
  </ActivityList>
</template>

<script setup lang="ts">
import { getActivityTranslation } from '../../functions/activities'
import AppLink from '../AppLink.vue'
import ActivityList from './ActivityList.vue'

defineProps<{
  user: string
}>()
</script>
