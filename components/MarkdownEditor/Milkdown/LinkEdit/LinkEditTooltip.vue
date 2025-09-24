<template>
  <EditorTooltip
    ref="toolTip"
    class="!left-3 !right-3 gap-2"
    @blur="reset"
  >
    <input
      ref="linkInput"
      v-model="updatedLink"
      class="flex-1"
      type="url"
      :placeholder="t('Collez un lien…')"
      @keydown.enter.stop.prevent="onConfirmEdit"
      @keydown="onCancel"
    >
    <button
      type="button"
      class="px-2 py-1 text-sm"
      :class="{ hidden: updatedLink.length === 0 }"
      @click.stop.prevent="onConfirmEdit"
    >
      {{ t("Confirmer ⏎") }}
    </button>
  </EditorTooltip>
</template>

<script setup lang="ts">
import { linkSchema } from '@milkdown/preset-commonmark'
import { usePluginViewContext } from '@prosemirror-adapter/vue'
import { ref, toRaw, watchEffect } from 'vue'
import { useInstance } from '@milkdown/vue'
import { makeTooltipProvider } from '../Tooltip/useTooltipProvider'
import { addLink } from '~/components/MarkdownEditor/ProseMirror/handleLink'
import { useLinkPreview } from '~/components/MarkdownEditor/Milkdown/LinkPreview/useLinkPreview'
import EditorTooltip from '~/components/MarkdownEditor/Milkdown/Tooltip/EditorTooltip.vue'
import { linkEditTooltipCtx, linkTooltipState } from '~/components/MarkdownEditor/Milkdown/LinkEdit/linkEditTooltipCtx'

const { t } = await useTranslation()

const toolTipRef = useTemplateRef<InstanceType<typeof EditorTooltip>>('toolTip')
const { link, updateLink } = useLinkPreview()
const updatedLink = ref('')

watchEffect(() => {
  updatedLink.value = link.value
})

const { view } = usePluginViewContext()
const [_loading, getEditor] = useInstance()
const { tooltipProvider } = makeTooltipProvider(linkEditTooltipCtx.key, toolTipRef)

function reset() {
  updateLink('')
  tooltipProvider.value?.hide()
};

function onConfirmEdit() {
  const editor = toRaw(getEditor())
  if (!editor) return
  const { mark } = editor.ctx.get(linkTooltipState.key)
  const type = linkSchema.type(editor.ctx)
  if (mark && mark.attrs.href === updatedLink.value) {
    reset()
    return
  }

  addLink(view.value, type.create({ href: updatedLink.value }), mark)
  reset()
}

function onCancel(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    reset()
  }
}
</script>
