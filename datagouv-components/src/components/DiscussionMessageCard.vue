<template>
  <ObjectCard
    :url="discussionUrl || discussion.self_web_url || '#'"
    :icon="RiChat3Line"
  >
    <template #title>
      {{ discussion.title }}
    </template>

    <div
      v-if="discussion.organization || discussion.user"
      class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2"
    >
      <ObjectCardOwner
        :organization="discussion.organization"
        :owner="discussion.user"
        :organization-url="organizationUrl"
      />
      <TranslationT
        class="text-sm/6 text-gray-secondary tabular-nums"
        keypath="Posté {date}"
      >
        <template #date>
          <FormattedDate
            :date="discussion.created"
            format="relative"
            :options="{ dateStyle: 'long', timeStyle: 'short' }"
          />
        </template>
      </TranslationT>
    </div>
    <ObjectCardShortDescription
      :text="firstMessageContent"
      class="mt-2 max-md:hidden"
    />
    <template
      v-if="$slots.default"
      #footer
    >
      <slot />
    </template>
  </ObjectCard>
</template>

<script setup lang="ts">
import { RiChat3Line } from '@remixicon/vue'
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { Thread } from '../types/discussions'
import FormattedDate from './FormattedDate.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import TranslationT from './TranslationT.vue'

const props = defineProps<{
  discussion: Thread
  discussionUrl?: RouteLocationRaw
  organizationUrl?: RouteLocationRaw
}>()

const firstMessageContent = computed(() => props.discussion.discussion?.[0]?.content)
</script>
