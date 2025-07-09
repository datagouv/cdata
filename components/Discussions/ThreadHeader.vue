<template>
  <header class="space-y-1">
    <div class="flex sm:items-center sm:justify-between flex-col sm:flex-row">
      <h3 class="m-0 text-base/normal text-gray-title flex items-center space-x-1">
        <RiLockLine
          v-if="thread.closed"
          class="size-4"
        />
        <span>{{ thread.title }}</span>
        <CopyButton
          :label="$t('Copier le lien vers cette discussion')"
          :copied-label="$t('Lien copié')"
          :text="getDiscussionUrl(thread.id, subject)"
        />
      </h3>
      <div
        v-if="showActions"
        class="space-x-2"
      >
        <BrandedButton
          v-if="isMeAdmin() && thread.spam?.status === 'potential_spam'"
          color="warning"
          size="xs"
          @click="markAsNoSpam"
        >
          {{ $t('Marquer comme non spam') }}
        </BrandedButton>
        <EditCommentModal
          v-if="firstComment.permissions.edit"
          :subject
          :thread="thread"
          :comment="firstComment"
          :index="0"
          @edited="$emit('change')"
        />
        <DeleteThreadModal
          v-if="thread.permissions.delete"
          :subject
          :thread
          @deleted="$emit('change')"
        />
        <!-- ! firstComment.permissions.edit is temporary because we can own the comment but cannot delete it… -->
        <ReportModal
          v-if="! thread.permissions.delete && ! firstComment.permissions.edit"
          :subject="{ class: 'Discussion', id: thread.id }"
        />
      </div>
    </div>
    <DiscussionCommentHeader
      :subject
      :comment="thread.discussion[0]"
    />
  </header>
</template>

<script setup lang="ts">
import { RiLockLine } from '@remixicon/vue'
import { BrandedButton, CopyButton } from '@datagouv/components-next'
import ReportModal from '../Spam/ReportModal.vue'
import DeleteThreadModal from './DeleteThreadModal.vue'
import DiscussionCommentHeader from './DiscussionCommentHeader.vue'
import EditCommentModal from './EditCommentModal.vue'
import type { DiscussionSubjectTypes, Thread } from '~/types/discussions'

const props = withDefaults(defineProps<{
  thread: Thread
  subject: DiscussionSubjectTypes
  showActions?: boolean
}>(), {
  showActions: false,
})
const emit = defineEmits<{
  change: []
}>()

const firstComment = computed(() => props.thread.discussion[0])

const { $api } = useNuxtApp()
const markAsNoSpam = async () => {
  await $api(`/api/1/discussions/${props.thread.id}/spam`, { method: 'DELETE' })
  emit('change')
}
</script>
