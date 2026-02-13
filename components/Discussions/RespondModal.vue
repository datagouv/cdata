<template>
  <ModalWithButton
    v-if="!thread.closed"
    :title="$t('Répondre')"
    size="lg"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        :icon="RiChatNewLine"
        size="xs"
        color="tertiary"
        icon-only
        keep-margins-even-without-borders
        :title="$t('Répondre à la discussion')"
        :aria-label="$t('Répondre à la discussion {title}', { title: thread.title })"
        v-bind="attrs"
        v-on="listeners"
      />
    </template>
    <template #default="{ close }">
      <DiscussionCard
        v-if="subject"
        :thread
        :subject
        @change="respond(close)"
      />
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { RiChatNewLine } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'
import DiscussionCard from '~/components/Discussions/DiscussionCard.vue'
import type { DiscussionSubjectTypes, Thread } from '~/types/discussions'

defineProps<{
  thread: Thread
  subject?: DiscussionSubjectTypes
}>()

const emit = defineEmits<{
  (e: 'responded'): void
}>()

function respond(close: () => void) {
  emit('responded')
  close()
}
</script>
