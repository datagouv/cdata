<template>
  <ModalWithButton
    :title="t('Êtes-vous sûrs de vouloir supprimer ce message ?')"
    size="lg"
    form
    @submit.prevent="deleteMessage"
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
        {{ $t('Supprimer') }}
      </BrandedButton>
    </template>

    <template #default>
      <CommentBlock
        :thread
        :comment
        :subject
      />
      <div class="mt-4 font-bold">
        {{ $t('Cette action est irréversible.') }}
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
          color="danger"
          size="xs"
          :loading
        >
          {{ t("Supprimer le commentaire") }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { RiDeleteBin6Line } from '@remixicon/vue'
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
  deleted: []
}>()

const { t } = await useTranslation()
const { $api } = useNuxtApp()

const loading = ref(false)

const deleteMessage = async (_: SubmitEvent, close: () => void) => {
  loading.value = true

  try {
    await $api(`/api/1/discussions/${props.thread.id}/comments/${props.index}/`, { method: 'DELETE' })
    close()
    emit('deleted')
  }
  finally {
    loading.value = false
  }
}
</script>
