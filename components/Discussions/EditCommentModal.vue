<template>
  <ModalWithButton
    :title="t('Éditer le message')"
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
        {{ $t('Modifier') }}
      </BrandedButton>
    </template>

    <template #default>
      <CommentBlock
        :thread
        :comment
        :subject
      />
      <div class="mt-4">
        <InputGroup
          v-if="index === 0 && thread.permissions.edit"
          v-model="form.title"
          :label="$t('Titre')"
          :required="true"
          :has-error="!!getFirstError('title')"
          :has-warning="!!getFirstWarning('title')"
          :error-text="getFirstError('title')"
        />

        <InputGroup
          v-model="form.comment"
          :label="$t('Votre message')"
          :required="true"
          type="textarea"
          :has-error="!!getFirstError('comment')"
          :has-warning="!!getFirstWarning('comment')"
          :error-text="getFirstError('comment')"
          :placeholder="$t('Merci de rester courtois et constructif. Eviter de communiquer des données personnelles.')"
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
          {{ t("Annuler") }}
        </BrandedButton>
        <BrandedButton
          type="submit"
          color="primary"
          size="xs"
          :loading
        >
          {{ t("Mettre à jour") }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { RiPencilLine } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'
import CommentBlock from './CommentBlock.vue'
import type { Comment, DiscussionSubjectTypes, Thread } from '~/types/discussions'

const props = defineProps<{
  subject: DiscussionSubjectTypes
  thread: Thread
  comment: Comment
  index: number
}>()
const emit = defineEmits<{
  edited: []
}>()

const { t } = await useTranslation()
const { $api } = useNuxtApp()

const { form, getFirstError, getFirstWarning } = useForm({
  title: props.thread.title,
  comment: props.comment.content,
})

const loading = ref(false)

const editMessage = async (_: SubmitEvent, close: () => void) => {
  loading.value = true

  try {
    if (form.value.title != props.thread.title) {
      await $api(`/api/1/discussions/${props.thread.id}/`, {
        method: 'PUT',
        body: {
          title: form.value.title,
        },
      })
    }
    if (form.value.comment != props.comment.content) {
      await $api(`/api/1/discussions/${props.thread.id}/comments/${props.index}/`, {
        method: 'PUT',
        body: {
          comment: form.value.comment,
        },
      })
    }

    close()
    emit('edited')
  }
  finally {
    loading.value = false
  }
}
</script>
