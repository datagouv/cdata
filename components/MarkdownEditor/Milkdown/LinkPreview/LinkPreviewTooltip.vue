<template>
  <EditorTooltip
    ref="toolTipRef"
    class="!left-3 !right-3 overflow-hidden gap-2"
    :class="{ hidden: link.length === 0 }"
    @focusout="() => tooltipProvider?.hide()"
  >
    <RiLink class="flex-none size-4" />
    <div class="flex-1 truncate">
      <a
        class="fr-link"
        :href="link"
        :title="link"
      >
        {{ link }}
      </a>
    </div>
    <div class="space-x-2">
      <BrandedButton
        type="button"
        :title="$t('Modifier le lien')"
        size="xs"
        color="primary-soft"
        :icon="RiPencilLine"
        @click="editLink"
      />
      <BrandedButton
        color="primary-soft"
        size="xs"
        :title="t('Supprimer le lien')"
        :icon="RiLinkUnlink"
        @click="deleteLink"
      />
    </div>
  </EditorTooltip>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { ref, toRaw } from 'vue'
import { usePluginViewContext } from '@prosemirror-adapter/vue'
import { useInstance } from '@milkdown/vue'
import { TextSelection } from '@milkdown/prose/state'
import { RiLink, RiLinkUnlink, RiPencilLine } from '@remixicon/vue'
import { linkTooltipState } from '~/components/MarkdownEditor/Milkdown/LinkEdit/linkEditTooltipCtx'
import { removeLink } from '~/components/MarkdownEditor/ProseMirror/handleLink'
import { makeTooltipProvider } from '~/components/MarkdownEditor/Milkdown/Tooltip/useTooltipProvider'
import EditorTooltip from '~/components/MarkdownEditor/Milkdown/Tooltip/EditorTooltip.vue'
import { insertLink } from '~/components/MarkdownEditor/Milkdown/LinkEdit/insertLink'
import { useLinkPreview } from '~/components/MarkdownEditor/Milkdown/LinkPreview/useLinkPreview'
import { linkPreviewTooltipCtx } from '~/components/MarkdownEditor/Milkdown/LinkPreview/linkPreviewTooltipCtx'

const { t } = useTranslation()
const toolTipRef = ref<InstanceType<typeof EditorTooltip> | null>(null)
const { tooltipProvider } = makeTooltipProvider(linkPreviewTooltipCtx.key, toolTipRef)
const { view } = usePluginViewContext()
const [_loading, getEditor] = useInstance()

const { link } = useLinkPreview()

function editLink() {
  const editor = toRaw(getEditor())
  if (!editor) return
  const { from, to } = editor.ctx.get(linkTooltipState.key)
  tooltipProvider.value?.hide()
  view.value.dispatch(view.value.state.tr.setSelection(TextSelection.create(view.value.state.doc, from, to)))
  insertLink(editor.ctx)
}

function deleteLink() {
  const editor = toRaw(getEditor())
  if (!editor) return
  const { from, to, mark } = editor.ctx.get(linkTooltipState.key)
  if (mark) {
    removeLink(view.value, from, to, mark)
  }
  tooltipProvider.value?.hide()
}
</script>
