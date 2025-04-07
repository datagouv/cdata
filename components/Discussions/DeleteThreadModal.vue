<template>
  <ModalWithButton
    :title="t('Are you sure you want to delete this discussion?')"
    size="lg"
    form
    @submit.prevent="deleteThread"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="RiDeleteBin6Line"
        icon-only
        v-bind="attrs"
        :loading
        v-on="listeners"
      >
        {{ $t('Delete') }}
      </BrandedButton>
    </template>

    <template #default>
      <ThreadHeader
        :subject
        :thread
      />
      <div
        class="prose whitespace-pre"
      >
        {{ thread.discussion[0].content }}
      </div>
      <div class="mt-16 font-bold">
        {{ $t('This action is irreversible. All comments in this discussion will also be deleted.') }}
      </div>
    </template>

    <template #footer="{ close }">
      <div class="w-full flex justify-end space-x-4">
        <BrandedButton
          color="secondary"
          size="xs"
          :loading
          @click="close"
        >
          {{ t("Cancel") }}
        </BrandedButton>
        <BrandedButton
          type="submit"
          color="danger"
          size="xs"
          :loading
        >
          {{ t("Delete discussion and comments") }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { RiDeleteBin6Line } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'
import ThreadHeader from './ThreadHeader.vue'
import type { DiscussionSubjectTypes, Thread } from '~/types/discussions'

const props = defineProps<{
  subject: DiscussionSubjectTypes
  thread: Thread
}>()
const emit = defineEmits<{
  deleted: []
}>()

const { t } = useI18n()
const { $api } = useNuxtApp()

const loading = ref(false)

const deleteThread = async (_: SubmitEvent, close: () => void) => {
  loading.value = true

  try {
    await $api(`/api/1/discussions/${props.thread.id}`, { method: 'DELETE' })
    close()
    emit('deleted')
  }
  finally {
    loading.value = false
  }
}
</script>
