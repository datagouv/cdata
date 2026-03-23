import { linkPreviewTooltip, linkPreviewTooltipCtx } from '~/components/MarkdownEditor/Milkdown/LinkPreview/linkPreviewTooltipCtx'

export const linkPreviewPlugins = [
  linkPreviewTooltipCtx,
  linkPreviewTooltip,
].flat()
