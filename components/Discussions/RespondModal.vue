<template>
  <ModalWithButton
    v-if="!thread.closed"
    :title="$t('Respond')"
    size="lg"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        :icon="RiChatNewLine"
        size="xs"
        color="secondary-softer"
        icon-only
        keep-margins-even-without-borders
        v-bind="attrs"
        v-on="listeners"
      >
        {{ $t('Respond to the discussion') }}
      </BrandedButton>
    </template>

    <div class="mb-5">
      <p class="font-bold text-base mb-0">
        {{ thread.title }}
      </p>
      <DiscussionCommentHeader
        :subject
        :comment="lastComment"
      />
    </div>

    <InputGroup
      v-model="comment"
      type="textarea"
      :label="$t('Your message')"
      :placeholder="$t('Please remain courteous and constructive. Avoid sharing personal information.')"
    />

    <template #footer="{ close }">
      <div
        class="flex-1 flex justify-end space-x-4"
      >
        <BrandedButton
          v-if="thread.permissions.close"
          color="warning"
          :loading
          :icon="RiChatDeleteLine"
          @click="send(true, close)"
        >
          {{ $t('Respond & Close') }}
        </BrandedButton>
        <BrandedButton
          color="primary"
          :loading
          :icon="RiSendPlaneLine"
          @click="send(false, close)"
        >
          {{ $t('Respond') }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { RiChatDeleteLine, RiChatNewLine, RiSendPlaneLine } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'
import DiscussionCommentHeader from './DiscussionCommentHeader.vue'
import type { DiscussionSubjectTypes, Thread } from '~/types/discussions'

const props = defineProps<{
  thread: Thread
  subject?: DiscussionSubjectTypes
}>()
const emit = defineEmits<{
  (e: 'responded'): void
}>()

const { $api } = useNuxtApp()
const loading = ref(false)

const comment = ref('')

const lastComment = computed(() => {
  return props.thread.discussion.slice(-1)[0]
})

const send = async (closeThread: boolean, closeModal: () => void) => {
  try {
    loading.value = true
    await $api(`/api/1/discussions/${props.thread.id}/`, {
      method: 'POST',
      body: {
        comment: comment.value,
        close: closeThread,
      },
    })
    emit('responded')
    comment.value = ''
    closeModal()
  }
  finally {
    loading.value = false
  }
}
</script>
