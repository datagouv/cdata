<template>
  <ModalWithButton
    v-model="opened"
    :title="thread.title"
    size="lg"
  >
    <template #default="{ close }">
      <DiscussionCard
        v-if="subject"
        :thread
        :subject
        respond-immediately
        @change="respond(close)"
      />
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import DiscussionCard from '~/components/Discussions/DiscussionCard.vue'
import type { DiscussionSubjectTypes, Thread } from '~/types/discussions'

defineProps<{
  thread: Thread
  subject?: DiscussionSubjectTypes
}>()

const emit = defineEmits<{
  (e: 'responded'): void
}>()

const opened = defineModel<boolean>()

function respond(close: () => void) {
  emit('responded')
  close()
}
</script>
