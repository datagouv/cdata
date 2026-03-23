import { editorViewCtx } from '@milkdown/core'
import type { Ctx } from '@milkdown/ctx'
import { posToDOMRect } from '@milkdown/prose'
import { $command } from '@milkdown/utils'
import { TextSelection } from 'prosemirror-state'
import { linkEditTooltipCtx, linkTooltipState } from '~/components/MarkdownEditor/Milkdown/LinkEdit/linkEditTooltipCtx'

export const insertLinkCommand = $command('InsertLink', ctx => () => () => insertLink(ctx))

export function insertLink(ctx: Ctx) {
  const view = ctx.get(editorViewCtx)
  const { selection } = view.state

  if (selection.empty) return false

  ctx.update(linkTooltipState.key, () => ({
    from: selection.from,
    to: selection.to,
    mark: null,
  }))

  view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, selection.from, selection.to)))

  const tooltip = ctx.get(linkEditTooltipCtx.key)
  tooltip?.show({
    getBoundingClientRect: () => posToDOMRect(view, selection.from, selection.to),
  })
  tooltip?.element.querySelector('input')?.focus()
  return true
}
