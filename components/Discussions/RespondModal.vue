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

    <div>
      <p class="font-bold text-base mb-0">
        {{ thread.title }}
      </p>
      <p>
        <AvatarWithName :user="lastComment.posted_by" />
        — {{ $t('Posted on {date}', { date: formatDate(lastComment.posted_on) }) }}
      </p>
    </div>

    <InputGroup
      v-model="comment"
      type="markdown"
      :label="$t('Your message')"
    />

    <template #footer="{ close }">
      <div
        class="flex-1 flex justify-end space-x-4"
      >
        <BrandedButton
          color="warning"
          :loading
          :icon="RiChatDeleteLine"
          :disabled="!comment"
          @click="send(true, close)"
        >
          {{ $t('Respond & Close') }}
        </BrandedButton>
        <BrandedButton
          color="primary"
          :loading
          :icon="RiSendPlaneLine"
          :disabled="!comment"
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
import { AvatarWithName, BrandedButton } from '@datagouv/components-next'
import type { Thread } from '~/types/discussions'

const props = defineProps<{
  thread: Thread
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
    await $api(`/api/1/discussions/${props.thread.id}`, {
      method: 'POST',
      body: {
        comment: comment.value,
        close: closeThread,
      },
    })
    emit('responded')
    closeModal()
  }
  finally {
    loading.value = false
  }
}
</script>
