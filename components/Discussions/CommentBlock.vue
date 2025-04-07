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
        <BrandedButton
          v-if="! comment.permissions.delete"
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
import EditCommentModal from './EditCommentModal.vue'
import { isProducerOfSubject, type Comment, type DiscussionSubjectTypes, type Thread } from '~/types/discussions'

const props = defineProps<{
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
