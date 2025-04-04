<template>
  <ModalWithButton
    :title="t('Edit message')"
    size="lg"
    form
    @submit.prevent="editMessage"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="RiPencilLine"
        icon-only
        v-bind="attrs"
        :loading
        v-on="listeners"
      >
        {{ $t('Edit') }}
      </BrandedButton>
    </template>

    <template #default>
      <CommentBlock :comment />
      <div class="mt-16">
        <InputGroup
          v-model="form.comment"
          :label="$t('Your message')"
          :required="true"
          type="textarea"
          :has-error="!!getFirstError('comment')"
          :has-warning="!!getFirstWarning('comment')"
          :error-text="getFirstError('comment')"
          :placeholder="$t('Please remain courteous and constructive. Avoid sharing personal information.')"
        />
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
          color="primary"
          size="xs"
          :loading
        >
          {{ t("Update") }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { RiPencilLine } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'
import CommentBlock from './CommentBlock.vue'
import type { Comment, Thread } from '~/types/discussions'

const props = defineProps<{
  thread: Thread
  comment: Comment
  index: number
}>()
const emit = defineEmits<{
  edited: []
}>()

const { t } = useI18n()
const { $api } = useNuxtApp()

const { form, getFirstError, getFirstWarning } = useForm({
  comment: props.comment.content,
})

const loading = ref(false)

const editMessage = async (_: SubmitEvent, close: () => void) => {
  loading.value = true

  try {
    await $api(`/api/1/discussions/${props.thread.id}/comments/${props.index}`, {
      method: 'PUT',
      body: {
        comment: form.value.comment,
      },
    })
    close()
    emit('edited')
  }
  finally {
    loading.value = false
  }
}
</script>
