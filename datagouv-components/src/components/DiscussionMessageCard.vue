<template>
  <ObjectCard>
    <ObjectCardHeader
      :icon="RiChat3Line"
      :url="discussionUrl || discussion.self_web_url || '#'"
    >
      {{ discussion.title }}
    </ObjectCardHeader>

    <div
      v-if="discussion.organization || discussion.user"
      class="text-sm flex flex-wrap md:flex-nowrap gap-y-1 items-center truncate"
    >
      <ObjectCardOwner
        :organization="discussion.organization"
        :owner="discussion.user"
        :organization-url="organizationUrl"
      />
      <RiSubtractLine
        aria-hidden="true"
        class="size-4 flex-none fill-gray-medium"
      />
      <TranslationT
        class="text-gray-medium whitespace-nowrap"
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

    <ObjectCardShortDescription :text="firstMessageContent" />

    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { RiChat3Line, RiSubtractLine } from '@remixicon/vue'
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
