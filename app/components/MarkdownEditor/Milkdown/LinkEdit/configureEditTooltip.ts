import type { Ctx } from '@milkdown/ctx'
import { usePluginViewFactory } from '@prosemirror-adapter/vue'
import { linkEditTooltip } from '~/components/MarkdownEditor/Milkdown/LinkEdit/linkEditTooltipCtx'
import LinkEditTooltip from '~/components/MarkdownEditor/Milkdown/LinkEdit/LinkEditTooltip.vue'

export function configureEditTooltip(ctx: Ctx) {
  const pluginViewFactory = usePluginViewFactory()

  ctx.set(linkEditTooltip.key, {
    view: pluginViewFactory({
      component: LinkEditTooltip,
    }),
  })
}
