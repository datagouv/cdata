<template>
  <AdminDeleteModal
    :title="t('Êtes-vous sûr de vouloir supprimer cette discussion ?')"
    :delete-url="`/api/1/discussions/${thread.id}/`"
    :delete-button-label="t('Supprimer la discussion et les commentaires')"
    :deletable-object="thread"
    object-type="discussion"
    :object-title="thread.title"
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

    <ThreadHeader
      :subject
      :thread
    />
    <ReadMore
      class="prose whitespace-pre-line max-w-none text-sm"
    >
      {{ thread.discussion[0].content }}
    </ReadMore>
    <div class="mt-4 font-bold">
      {{ $t('Cette action est irréversible. Tous les commentaires de cette discussion seront aussi supprimés.') }}
    </div>
  </AdminDeleteModal>
</template>

<script setup lang="ts">
import { RiDeleteBin6Line } from '@remixicon/vue'
import { BrandedButton, ReadMore } from '@datagouv/components-next'
import AdminDeleteModal from '~/components/Admin/AdminDeleteModal.vue'
import ThreadHeader from './ThreadHeader.vue'
import type { DiscussionSubjectTypes, Thread } from '~/types/discussions'

defineProps<{
  subject: DiscussionSubjectTypes
  thread: Thread
}>()

const emit = defineEmits<{
  deleted: []
}>()

const { t } = useTranslation()
</script>
