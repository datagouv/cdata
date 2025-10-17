<template>
  <ActivityList :user>
    <template #activity="{ class: cls, activity }">
      {{ getActivityTranslation(activity) }}
      <slot :activity>
        <div :class="cls">
          <AppLink
            :to="activity.related_to_url"
            class="link flex truncate"
            target="_blank"
          >
            <span
              class="truncate"
            >{{ activity.related_to }}</span>
          </AppLink>
        </div>
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
