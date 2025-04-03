<template>
  <div class="border-l-2 pl-2.5 border-gray-default">
    <div class="flex justify-between items-center">
      <DiscussionCommentHeader
        :comment
        class="mb-1"
      />
      <div>
        <DeleteCommentModal
          v-if="forDeleteInfo && comment.permissions.delete"
          :thread="forDeleteInfo.thread"
          :comment
          :index="forDeleteInfo.index"
          @deleted="$emit('deleted')"
        />
        <BrandedButton
          v-else-if="! comment.permissions.delete"
          color="secondary"
          size="xs"
          :icon="RiFlagLine"
          icon-only
        >
          {{ $t('Report') }}
        </BrandedButton>
      </div>
    </div>
    <div class="prose whitespace-pre">
      {{ comment.content }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { RiFlagLine } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'
import DiscussionCommentHeader from './DiscussionCommentHeader.vue'
import DeleteCommentModal from './DeleteCommentModal.vue'
import type { Comment, Thread } from '~/types/discussions'

defineProps<{
  comment: Comment
  forDeleteInfo?: {
    thread: Thread
    index: number
  }
}>()
defineEmits<{
  deleted: []
}>()
</script>
