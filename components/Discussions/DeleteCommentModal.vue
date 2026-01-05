<template>
  <AdminDeleteModal
    :title="t('Êtes-vous sûrs de vouloir supprimer ce message ?')"
    :delete-url="`/api/1/discussions/${thread.id}/comments/${index}/`"
    :delete-button-label="t('Supprimer le commentaire')"
    :owned-object="comment"
    object-type="comment"
    @deleted="emit('deleted')"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="RiDeleteBin6Line"
        icon-only
        :title="$t('Supprimer')"
        v-bind="attrs"
        v-on="listeners"
      />
    </template>

    <CommentBlock
      :thread
      :comment
      :subject
    />
    <div class="mt-4 font-bold">
      {{ $t('Cette action est irréversible.') }}
    </div>
  </AdminDeleteModal>
</template>

<script setup lang="ts">
import { RiDeleteBin6Line } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'
import AdminDeleteModal from '~/components/Admin/AdminDeleteModal.vue'
import CommentBlock from './CommentBlock.vue'
import type { Comment, DiscussionSubjectTypes, Thread } from '~/types/discussions'

defineProps<{
  subject: DiscussionSubjectTypes
  thread: Thread
  comment: Comment
  index: number
}>()

const emit = defineEmits<{
  deleted: []
}>()

const { t } = useTranslation()
</script>
