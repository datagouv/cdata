import type { Ctx } from '@milkdown/ctx'
import { linkSchema } from '@milkdown/preset-commonmark'
import type { EditorView } from 'prosemirror-view'
import { getMarkInNode } from '~/components/MarkdownEditor/ProseMirror/getMarkInNode'
import { getNodeAtCoords } from '~/components/MarkdownEditor/ProseMirror/getNodeAtCoords'
import { linkPreviewTooltip } from '~/components/MarkdownEditor/Milkdown/LinkPreview/linkPreviewTooltipCtx'

export function shouldShowPreview(ctx: Ctx, view: EditorView, event: MouseEvent) {
  const { node, pos } = getNodeAtCoords({ left: event.clientX, top: event.clientY }, view)

  if (!node)
    return

  const mark = getMarkInNode(node, linkSchema.mark.type(ctx))
  if (!mark)
    return

  const key = linkPreviewTooltip.pluginKey()
  if (!key)
    return

  return { show: true, pos, node, mark }
}
