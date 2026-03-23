<template>
  <MilkdownProvider>
    <ProsemirrorAdapterProvider>
      <InternalEditor
        v-bind="{ ...props, ...$attrs }"
        @change="(value) => $emit('change', value)"
        @editor-mounted="$emit('editorMounted')"
      />
    </ProsemirrorAdapterProvider>
  </MilkdownProvider>
</template>

<script setup lang="ts">
import { MilkdownProvider } from '@milkdown/vue'
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/vue'
import InternalEditor from '~/components/MarkdownEditor/InternalEditor.vue'
import type { MarkdownEditorProps } from '~/components/MarkdownEditor/types'
import { useLinkPreviewProvider } from '~/components/MarkdownEditor/Milkdown/LinkPreview/useLinkPreview'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<MarkdownEditorProps>()

defineEmits<{
  (event: 'change', value: string): void
  (event: 'editorMounted'): void
}>()

useLinkPreviewProvider()
</script>
