import type { TooltipProvider } from '@milkdown/plugin-tooltip'
import { tooltipFactory } from '@milkdown/plugin-tooltip'
import { $ctx } from '@milkdown/utils'

export const linkPreviewTooltipCtx = $ctx<TooltipProvider | null, 'linkPreviewTooltip'>(
  null,
  'linkPreviewTooltip',
)

export const linkPreviewTooltip = tooltipFactory('LINK_PREVIEW')
