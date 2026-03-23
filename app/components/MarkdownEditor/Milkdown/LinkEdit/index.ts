import { insertLinkCommand } from '~/components/MarkdownEditor/Milkdown/LinkEdit/insertLink'
import { linkEditTooltip, linkTooltipState, linkEditTooltipCtx } from '~/components/MarkdownEditor/Milkdown/LinkEdit/linkEditTooltipCtx'

export const linkEditPlugins = [
  linkEditTooltipCtx,
  linkEditTooltip,
  linkTooltipState,
  insertLinkCommand,
].flat()

export { insertLinkCommand }
