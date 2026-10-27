<template>
  <ObjectCard class="discussion-card">
    <ObjectCardHeader :icon="RiChat3Line" :url="discussionUrl || discussion.self_web_url || '#'">
      {{ discussion.title }}
    </ObjectCardHeader>

    <div v-if="discussion.organization || discussion.user" class="discussion-card__meta">
      <ObjectCardOwner
        :organization="discussion.organization"
        :owner="discussion.user"
        :organization-url="organizationUrl"
      />
      <TranslationT class="discussion-card__date" keypath="Posté {date}">
        <template #date>
          <FormattedDate
            :date="discussion.created"
            format="relative"
            :options="{ dateStyle: 'long', timeStyle: 'short' }"
          />
        </template>
      </TranslationT>
    </div>

    <ObjectCardShortDescription :text="firstMessageContent" />

    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { RiChat3Line } from '@remixicon/vue'
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { Thread } from '../types/discussions'
import ObjectCard from './ObjectCard.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import FormattedDate from './FormattedDate.vue'
import TranslationT from './TranslationT.vue'

const props = defineProps<{
  discussion: Thread
  discussionUrl?: RouteLocationRaw
  organizationUrl?: RouteLocationRaw
}>()

const firstMessageContent = computed(() => props.discussion.discussion?.[0]?.content)
</script>

<style scoped>
.discussion-card :deep(.object-card__body) {
  gap: 0.75rem;
}
.discussion-card__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  font-size: 0.875rem;
}
.discussion-card__date {
  color: #555;
  font-variant-numeric: tabular-nums;
}
</style>
