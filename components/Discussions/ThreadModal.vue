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
        :follow-state="follows.stateOf({ class: 'Discussion', id: thread.id })"
        respond-immediately
        @change="respond(close)"
      />
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import DiscussionCard from '~/components/Discussions/DiscussionCard.vue'
import type { DiscussionSubjectTypes, Thread } from '~/types/discussions'

const props = defineProps<{
  thread: Thread
  subject?: DiscussionSubjectTypes
}>()

const emit = defineEmits<{
  (e: 'responded'): void
}>()

const opened = defineModel<boolean>()

const follows = useFollowStates(() => [{ class: 'Discussion', id: props.thread.id }], 'discussion')
// The admin table mounts it already open.
watch(opened, (isOpened) => {
  if (isOpened) follows.read()
}, { immediate: true })

function respond(close: () => void) {
  emit('responded')
  close()
}
</script>
