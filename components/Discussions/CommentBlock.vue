<template>
  <div
    class="border-l-2 pl-2.5 "
    :class="{
      'border-datagouv-dark': isProducer,
      'border-gray-default': !isProducer,
    }"
  >
    <div class="flex justify-between items-center">
      <DiscussionCommentHeader
        :comment
        :subject
        class="mb-1"
      />
      <div class="space-x-2">
        <EditCommentModal
          v-if="forEditInfo && comment.permissions.edit"
          :subject
          :thread="forEditInfo.thread"
          :comment
          :index="forEditInfo.index"
          @edited="$emit('change')"
        />
        <DeleteCommentModal
          v-if="forDeleteInfo && comment.permissions.delete"
          :subject
          :thread="forDeleteInfo.thread"
          :comment
          :index="forDeleteInfo.index"
          @deleted="$emit('change')"
        />
        <ReportModal
          v-if="! comment.permissions.delete && ! comment.permissions.edit"
          :subject="{ class: 'Discussion', id: thread.id }"
        />
      </div>
    </div>
    <ReadMore class="prose whitespace-pre-line max-w-none">
      {{ comment.content }}
    </ReadMore>
  </div>
</template>

<script setup lang="ts">
import { ReadMore } from '@datagouv/components-next'
import ReportModal from '../Spam/ReportModal.vue'
import DiscussionCommentHeader from './DiscussionCommentHeader.vue'
import DeleteCommentModal from './DeleteCommentModal.vue'
import EditCommentModal from './EditCommentModal.vue'
import type { Comment, DiscussionSubjectTypes, Thread } from '~/types/discussions'
import { isProducerOfSubject } from '~/utils/discussions'

const props = defineProps<{
  thread: Thread
  comment: Comment
  subject: DiscussionSubjectTypes
  forDeleteInfo?: {
    thread: Thread
    index: number
  }
  forEditInfo?: {
    thread: Thread
    index: number
  }
}>()
defineEmits<{
  change: []
}>()

const isProducer = computed(() => isProducerOfSubject(props.subject, props.comment))
</script>
