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
      class="prose-h2:text-3xl prose-h3:text-2xl"
      :class="sectionColor ? 'text-white prose-invert prose-h2:text-white prose-h3:text-white prose-a:text-white! prose-strong:text-white!' : 'prose-h2:text-gray-title prose-h3:text-gray-title'"
      :content="bloc.content"
      :min-heading="2"
      size="md"
      :follow-links="followLinks"
    />
  </div>
</template>

<script setup lang="ts">
import { MarkdownViewer } from '@datagouv/components-next'
import MarkdownEditor from '~/components/MarkdownEditor/MarkdownEditor.vue'
import type { MarkdownBloc } from '~/types/pages'
import { FOLLOW_LINKS, SECTION_COLOR } from '~/utils/blocs'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<MarkdownBloc>({ required: true })

// On a colored section, the text is white. The links and the bold text too: important, as the
// viewer gives them a gray of its own, on the same element.
const sectionColor = inject(SECTION_COLOR, ref(null))

const followLinks = inject(FOLLOW_LINKS, false)
</script>
