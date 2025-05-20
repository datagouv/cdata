<template>
  <div class="editor__container px-4 py-2 rounded-t shadow-input bg-[var(--background-contrast-grey)]">
    <div
      class="mx-auto flex flex-wrap pb-1 gap-2 *:flex *:gap-1"
      role="menubar"
    >
      <div role="group" v-if="! raw">
        <EditorButton
          :icon="RiArrowGoBackLine"
          :title="t('Undo')"
          @click="() => call(undoCommand.key)"
        />
        <EditorButton
          :icon="RiArrowGoForwardLine"
          :title="t('Redo')"
          @click="() => call(redoCommand.key)"
        />
      </div>
      <div
        role="separator"
        class="w-px bg-neutral-300 my-1"
        v-if="!raw"
      />
      <div role="group" v-if="!raw">
        <EditorButton
          :icon="RiBold"
          :title="t('Bold')"
          @click="() => call(toggleStrongCommand.key)"
        />
        <EditorButton
          :icon="RiItalic"
          :title="t('Italic')"
          @click="() => call(toggleEmphasisCommand.key)"
        />
        <EditorButton
          :icon="RiH1"
          :title="t('Title')"
          @click="() => call(wrapInHeadingCommand.key, 3)"
        />
        <EditorButton
          :icon="RiH2"
          :title="t('Subtitle')"
          @click="() => call(wrapInHeadingCommand.key, 4)"
        />
      </div>
      <div
        role="separator"
        class="w-px bg-neutral-300 my-1"
        v-if="!raw"
      />
      <div role="group" v-if="!raw">
        <EditorButton
          :icon="RiTable2"
          :title="t('Table')"
          @click="() => call(insertTableCommand.key)"
        />
        <EditorButton
          :icon="RiLink"
          :title="t('Link')"
          @click="() => call(insertLinkCommand.key)"
        />
        <ImageModalButton
          @send="(data: ImageModalForm) => call(insertImageCommand.key, data)"
        />
      </div>
      <div
        role="separator"
        class="w-px bg-neutral-300 my-1"
        v-if="!raw"
      />
      <div role="group" v-if="!raw">
        <EditorButton
          :icon="RiListUnordered"
          :title="t('List unordered')"
          @click="() => call(wrapInBulletListCommand.key)"
        />
        <EditorButton
          :icon="RiListOrdered"
          :title="t('List ordered')"
          @click="() => call(wrapInOrderedListCommand.key)"
        />
        <EditorButton
          :icon="RiCodeSSlashLine"
          :title="t('Code block')"
          @click="() => call(createCodeBlockCommand.key)"
        />
        <EditorButton
          :icon="RiDoubleQuotesL"
          :title="t('Quote')"
          @click="() => call(wrapInBlockquoteCommand.key)"
        />
      </div>
      <div class="ml-auto">
        <EditorButton
          :icon="raw ? RiHtml5Line : RiMarkdownLine"
          :title="raw ? $t('Voir le HTML') : $t('Voir le markdown')"
          @click="raw = !raw"
        />
      </div>
    </div>
    <div class="p-1">
      <textarea v-if="raw" :value @change="$emit('change', $event.target.value)" class="w-full text-sm" rows="10"></textarea>
      <Milkdown
        v-else
        :class="[markdownSmClasses, markdownTableEditorCLasses]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CmdKey } from '@milkdown/core'
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx } from '@milkdown/core'
import type { Ctx } from '@milkdown/ctx'
import { history, redoCommand, undoCommand } from '@milkdown/plugin-history'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import {
  commonmark,
  createCodeBlockCommand,
  insertImageCommand,
  linkAttr,
  paragraphAttr,
  toggleEmphasisCommand,
  toggleStrongCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInHeadingCommand,
  wrapInOrderedListCommand,
} from '@milkdown/preset-commonmark'
import {
  insertTableCommand,
  gfm,
  columnResizingPlugin,
} from '@milkdown/preset-gfm'
import { callCommand } from '@milkdown/utils'
import { RiArrowGoBackLine, RiArrowGoForwardLine, RiBold, RiCodeSSlashLine, RiDoubleQuotesL, RiH1, RiH2, RiHtml5Line, RiItalic, RiLink, RiListOrdered, RiListUnordered, RiMarkdownLine, RiTable2 } from '@remixicon/vue'
import { Milkdown, useEditor } from '@milkdown/vue'
import { usePluginViewFactory, useWidgetViewFactory } from '@prosemirror-adapter/vue'
import { useDebounceFn } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import type { ImageModalForm } from '~/components/MarkdownEditor/ImageModal/ImageModalButton.vue'
import ImageModalButton from '~/components/MarkdownEditor/ImageModal/ImageModalButton.vue'
import { dsfrColumnResizingPlugin } from '~/components/MarkdownEditor/Milkdown/dsfrColumnResizingPlugin'
import { tableSelectorPlugin } from '~/components/MarkdownEditor/Milkdown/TableSelector/tableSelectorPlugin'
import { insertLinkCommand, linkEditPlugins } from '~/components/MarkdownEditor/Milkdown/LinkEdit'
import { configureEditTooltip } from '~/components/MarkdownEditor/Milkdown/LinkEdit/configureEditTooltip'
import { linkPreviewPlugins } from '~/components/MarkdownEditor/Milkdown/LinkPreview'
import { configurePreviewTooltip } from '~/components/MarkdownEditor/Milkdown/LinkPreview/configurePreviewTooltip'
import { useLinkPreview } from '~/components/MarkdownEditor/Milkdown/LinkPreview/useLinkPreview'
import { tableTooltip, tableTooltipCtx } from '~/components/MarkdownEditor/Milkdown/TableTooltip/tableTooltipCtx'
import TableTooltip from '~/components/MarkdownEditor/Milkdown/TableTooltip/TableTooltip.vue'
import EditorButton from '~/components/MarkdownEditor/EditorButton.vue'
import type { MarkdownEditorProps } from '~/components/MarkdownEditor/types'

import 'prosemirror-view/style/prosemirror.css'
import 'prosemirror-tables/style/tables.css'

const props = withDefaults(defineProps<MarkdownEditorProps>(), {
  disabled: false,
  value: '',
})
const emit = defineEmits<{
  (event: 'change', value: string): void
  (event: 'editorMounted'): void
}>()

const raw = ref(false)
const onChange = useDebounceFn((markdown: string) => emit('change', markdown), 300)

const { t } = useI18n()

const pluginViewFactory = usePluginViewFactory()
const widgetViewFactory = useWidgetViewFactory()

const { updateLink } = useLinkPreview()

const columnResizingPluginIndex = gfm.findIndex(plugin => plugin === columnResizingPlugin)
gfm[columnResizingPluginIndex] = dsfrColumnResizingPlugin

const gfmPlugins = [
  gfm,
  tableTooltip,
  tableTooltipCtx,
  (ctx: Ctx) => async () => {
    ctx.set(tableTooltip.key, {
      view: pluginViewFactory({
        component: TableTooltip,
      }),
    })
  },
  tableSelectorPlugin(widgetViewFactory),
].flat()

const editor = useEditor(root =>
  Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root)
      configureEditTooltip(ctx)
      configurePreviewTooltip(ctx, updateLink)
      ctx.set(defaultValueCtx, props.value)
      ctx.update(editorViewOptionsCtx, (prev) => {
        const prevAttr = prev.attributes

        return {
          ...prev,
          attributes: (state) => {
            const attrs = typeof prevAttr === 'function' ? prevAttr(state) : (prevAttr ?? {})
            attrs.id = props.id
            attrs['data-testid'] = 'markdown-editor'
            attrs['class'] = 'min-h-24 w-full'
            if (props.ariaLabelledBy) {
              attrs['aria-labelledby'] = props.ariaLabelledBy
            }
            else if (props.ariaLabel) {
              attrs.ariaLabel = props.ariaLabel
            }
            return {
              ...attrs,
            }
          },
          editable: () => !props.disabled,
        }
      })

      ctx.set(paragraphAttr.key, () => ({ class: 'text-sm' }))
      ctx.set(linkAttr.key, () => ({ class: 'fr-link' }))
      ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, _prevMarkdown) => onChange(markdown))
      ctx.get(listenerCtx).mounted((_ctx) => {
        emit('editorMounted')
      })
    })
    .use(commonmark)
    .use(gfmPlugins)
    .use(history)
    .use(linkEditPlugins)
    .use(linkPreviewPlugins)
    .use(listener),
)

function call<T>(command: CmdKey<T>, payload?: T) {
  return editor.get()?.action(callCommand(command, payload))
}
</script>
