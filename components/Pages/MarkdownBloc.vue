<template>
  <div
    v-if="edit"
    class="bg-white border rounded-lg overflow-hidden"
  >
    <MarkdownEditor
      :id="`markdown-bloc-${bloc.id}`"
      :heading-levels="3"
      :min-heading="2"
      :value="bloc.content"
      @change="bloc.content = $event"
    />
  </div>
  <div
    v-else
    class="max-w-4xl"
  >
    <MarkdownViewer
      class="prose-h2:text-3xl prose-h2:text-gray-title prose-h3:text-2xl prose-h3:text-gray-title"
      :content="bloc.content"
      :min-heading="2"
      size="md"
    />
  </div>
</template>

<script setup lang="ts">
import { MarkdownViewer } from '@datagouv/components-next'
import MarkdownEditor from '~/components/MarkdownEditor/MarkdownEditor.vue'
import type { MarkdownBloc } from '~/types/pages'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<MarkdownBloc>({ required: true })
</script>
