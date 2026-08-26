// Leaves room for the sticky elements sitting at the top of the viewport.
const SCROLL_MARGIN = 100

/**
 * Bring the top of a block back into view after its content changed (paging,
 * searching, filtering), so the reader restarts at the first result.
 *
 * Does nothing when the top of the block is already on screen: aligning the
 * viewport on a block the reader is already looking at moves the page under
 * them for no reason.
 */
export function scrollToBlockTop(block: HTMLElement | null | undefined) {
  if (!block) return

  const { top } = block.getBoundingClientRect()
  if (top >= 0 && top <= window.innerHeight) return

  block.style.scrollMarginTop = `${SCROLL_MARGIN}px`
  block.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
