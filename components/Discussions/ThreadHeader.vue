<template>
  <header class="space-y-1">
    <div class="flex sm:items-center sm:justify-between flex-col sm:flex-row">
      <h3 class="m-0 text-base/normal text-gray-title flex items-center space-x-1">
        <RiLockLine
          v-if="thread.closed"
          class="size-4"
        />
        <span>{{ thread.title }}</span>
      </h3>
      <div v-if="showActions">
        <DeleteThreadModal
          v-if="thread.permissions.delete"
          :thread
          @deleted="$emit('deleted')"
        />
        <BrandedButton
          v-else
          color="secondary"
          size="xs"
          :icon="RiFlagLine"
          icon-only
        >
          {{ $t('Report') }}
        </BrandedButton>
      </div>
    </div>
    <DiscussionCommentHeader
      :subject
      :comment="thread.discussion[0]"
    />
  </header>
</template>

<script setup lang="ts">
import { RiFlagLine, RiLockLine } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'
import DeleteThreadModal from './DeleteThreadModal.vue'
import DiscussionCommentHeader from './DiscussionCommentHeader.vue'
import type { DiscussionSubjectTypes, Thread } from '~/types/discussions'

withDefaults(defineProps<{
  thread: Thread
  subject: DiscussionSubjectTypes
  showActions?: boolean
}>(), {
  showActions: false,
})
defineEmits<{
  deleted: []
}>()
</script>
