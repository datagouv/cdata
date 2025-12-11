import type { Ctx } from '@milkdown/ctx'
import { usePluginViewFactory } from '@prosemirror-adapter/vue'
import type { EditorView } from 'prosemirror-view'
import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { posToDOMRect } from '@milkdown/prose'
import { findMarkPosition } from '~/components/MarkdownEditor/ProseMirror/findMarkPosition'
import { linkEditTooltipCtx, linkTooltipState } from '~/components/MarkdownEditor/Milkdown/LinkEdit/linkEditTooltipCtx'
import LinkPreviewTooltip from '~/components/MarkdownEditor/Milkdown/LinkPreview/LinkPreviewTooltip.vue'
import { linkPreviewTooltip, linkPreviewTooltipCtx } from '~/components/MarkdownEditor/Milkdown/LinkPreview/linkPreviewTooltipCtx'
import { shouldShowPreview } from '~/components/MarkdownEditor/Milkdown/LinkPreview/shouldShowPreview'

const DELAY = 200

export function configurePreviewTooltip(ctx: Ctx, updateLink: (newLink: string) => void) {
  const pluginViewFactory = usePluginViewFactory()
  const hovering = ref(false)

  const onMouseEnterTooltip = () => {
    hovering.value = true
  }

  const onMouseLeaveTooltip = () => {
    hovering.value = false
  }

  const onMouseMoveDebounced = useDebounceFn((view: EditorView, event: MouseEvent) => {
    if (!view.hasFocus())
      return

    const result = shouldShowPreview(ctx, view, event)
    const tooltip = ctx.get(linkPreviewTooltipCtx.key)
    if (result) {
      const position = view.state.doc.resolve(result.pos)
      const markPosition = findMarkPosition(result.mark, view.state.doc, position.before(), position.after())
      const tool = ctx.get(linkPreviewTooltip.key)
      if (!tool || !tool.view) return
      ctx.update(linkTooltipState.key, () => ({
        from: markPosition.start,
        to: markPosition.end,
        mark: result.mark,
      }))
      updateLink(result.mark.attrs.href)

      tooltip?.show({
        getBoundingClientRect: () => posToDOMRect(view, markPosition.start, markPosition.end),
      })
      tooltip?.element.addEventListener('mouseenter', onMouseEnterTooltip)
      tooltip?.element.addEventListener('mouseleave', onMouseLeaveTooltip)
      return
    }

    onMouseLeave()
  }, DELAY)

  const onMouseMove = (view: EditorView, event: MouseEvent) => {
    onMouseMoveDebounced(view, event)
  }

  const onMouseLeave = () => {
    setTimeout(() => {
      if (hovering.value) {
        return
      }
      const previewTooltip = ctx.get(linkPreviewTooltipCtx.key)
      const editTooltip = ctx.get(linkEditTooltipCtx.key)
      previewTooltip?.hide()
      if (!editTooltip?.element.dataset.show) {
        updateLink('')
      }
      previewTooltip?.element.removeEventListener('mouseenter', onMouseEnterTooltip)
      previewTooltip?.element.removeEventListener('mouseleave', onMouseLeaveTooltip)
    }, DELAY)
  }

  ctx.set(linkPreviewTooltip.key, {
    props: {
      handleDOMEvents: {
        mousemove: onMouseMove,
        mouseleave: onMouseLeave,
      },
    },
    view: pluginViewFactory({
      component: LinkPreviewTooltip,
    }),
  })
}
