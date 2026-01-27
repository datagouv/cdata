<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    v-if="edit"
    class="bg-white border rounded-lg overflow-hidden"
  >
    <MarkdownEditor
      :id="`markdown-bloc-${bloc.id}`"
      :value="bloc.content"
      @change="bloc.content = $event"
    />
  </div>
  <div
    v-else
    :class="markdownClasses"
    v-html="formatMarkdown(bloc.content)"
  />
</template>

<script setup lang="ts">
import { formatMarkdown, markdownClasses } from '@datagouv/components-next'
import MarkdownEditor from '~/components/MarkdownEditor/MarkdownEditor.vue'
import type { MarkdownBloc } from '~/types/pages'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<MarkdownBloc>({ required: true })
</script>
