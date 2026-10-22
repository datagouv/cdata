import { rowShare, type BlocClass } from '~/utils/blocsLayout'

// What is being dragged: a band of the page (a section), an accordion item, or a bloc,
// whose class decides where it can land.
export type Dragged = { kind: 'band' | 'accordion-item' } | { kind: 'bloc', blocClass: BlocClass }

type DropList = {
  // `grid` for the blocs of a section or an accordion item, laid out side by side in rows;
  // `vertical` for the others.
  orientation: 'vertical' | 'grid'
  items: () => unknown[]
  accepts: (dragged: Dragged) => boolean
}

type DragStart = Dragged & { list: HTMLElement, index: number, label: string }
type DragSource = DragStart & { element: HTMLElement }

type DropTarget = {
  list: HTMLElement
  index: number
  // Where the indicator goes, in viewport coordinates.
  line: { left: number, top: number, width: number, height: number }
}

export type DragState = { source: DragSource, x: number, y: number, target: DropTarget | null }

// Each list element of the editor and what it accepts. A list is the element holding its
// items (`data-drop-item`), marked with `data-drop-list`.
const dropLists = new WeakMap<HTMLElement, DropList>()

// One drag at a time in the page, read by `BlocsDragLayer` to draw the indicator.
export const blocsDrag = shallowRef<DragState | null>(null)

function itemElements(list: HTMLElement): Array<HTMLElement> {
  return [...list.children].filter((child): child is HTMLElement => child.hasAttribute('data-drop-item'))
}

export function useDropList(list: Ref<HTMLElement | null>, options: DropList) {
  watch(list, (element, previous) => {
    if (previous) dropLists.delete(previous)
    if (element) dropLists.set(element, options)
  }, { immediate: true })
  onUnmounted(() => {
    if (list.value) dropLists.delete(list.value)
  })
}

// Index the pointer points at in a list, and where to draw it.
function place(listElement: HTMLElement, list: DropList, source: DragSource, x: number, y: number): DropTarget {
  const rects = itemElements(listElement).map(item => item.getBoundingClientRect())
  const listRect = listElement.getBoundingClientRect()

  if (list.orientation === 'vertical') {
    const index = rects.filter(rect => rect.top + rect.height / 2 < y).length
    let lineY: number
    if (!rects.length) lineY = listRect.top + listRect.height / 2
    else if (index === 0) lineY = rects[0].top - 4
    else if (index === rects.length) lineY = rects[index - 1].bottom + 4
    else lineY = (rects[index - 1].bottom + rects[index].top) / 2
    return { list: listElement, index, line: { left: listRect.left, top: lineY - 1, width: listRect.width, height: 2 } }
  }

  if (!rects.length) {
    return { list: listElement, index: 0, line: { left: listRect.left, top: listRect.top + listRect.height / 2 - 1, width: listRect.width, height: 2 } }
  }
  // Blocs wrap in rows: those of the rows above, then, in the pointer's row, those on its
  // left. On a bloc, its left half; or its upper half when it is alone on its row, the
  // others being above and below.
  const sameRow = (a: DOMRect, b: DOMRect) => a.top === b.top
  const index = rects.filter((rect) => {
    if (rect.bottom < y) return true
    if (rect.top > y || rect.left > x) return false
    if (rect.right < x) return true
    const alone = rects.every(other => other === rect || !sameRow(other, rect))
    return alone ? rect.top + rect.height / 2 < y : rect.left + rect.width / 2 < x
  }).length
  const before = rects[index - 1]
  const after = rects[index]
  const columnGap = (element: HTMLElement) => Number.parseFloat(getComputedStyle(element).columnGap) || 0
  const gap = columnGap(listElement)
  // The dragged bloc keeps its width, its share of a row: after the last bloc of a row, it
  // stays on that row if it fits in what is left.
  const fits = () => {
    const sourceList = source.element.parentElement!
    const share = rowShare(source.element.getBoundingClientRect().width, sourceList.getBoundingClientRect().width, columnGap(sourceList))
    return before.right + share * (listRect.width + gap) <= listRect.right + 1
  }
  // Between two blocs of a row, or at the end of a row with room for it: a vertical line,
  // in the middle of the gap.
  if (before && ((after && sameRow(before, after)) || fits())) {
    return { list: listElement, index, line: { left: before.right + gap / 2 - 1, top: before.top, width: 2, height: before.height } }
  }
  // Otherwise the bloc starts a row: a line across the list, above that row.
  const lineY = !after ? before.bottom + 4 : before ? (before.bottom + after.top) / 2 : after.top - 4
  return { list: listElement, index, line: { left: listRect.left, top: lineY - 1, width: listRect.width, height: 2 } }
}

// The innermost list under the pointer that accepts what is dragged. When it does not, the
// first list inside the item under the pointer that does: the margins of a section around
// its blocs are aimed at to put a bloc first or last. Then its parent list, and so on.
// Never a list inside the dragged element itself.
function resolveTarget(source: DragSource, x: number, y: number): DropTarget | null {
  const hit = document.elementFromPoint(x, y)
  const accepting = (listElement: HTMLElement) => {
    const list = dropLists.get(listElement)
    return list && !source.element.contains(listElement) && list.accepts(source) ? list : null
  }
  let listElement = hit?.closest<HTMLElement>('[data-drop-list]') ?? null
  while (listElement) {
    const list = accepting(listElement)
    if (list) return place(listElement, list, source, x, y)
    const item = itemElements(listElement).find(element => element.contains(hit))
    const inner = [...item?.querySelectorAll<HTMLElement>('[data-drop-list]') ?? []].find(accepting)
    if (inner) return place(inner, accepting(inner)!, source, x, y)
    listElement = listElement.parentElement?.closest<HTMLElement>('[data-drop-list]') ?? null
  }
  return null
}

function drop({ source, target }: DragState) {
  if (!target) return
  const from = dropLists.get(source.list)
  const to = dropLists.get(target.list)
  if (!from || !to) return

  let index = target.index
  if (target.list === source.list) {
    // Right before or right after itself: it does not move.
    if (index === source.index || index === source.index + 1) return
    if (index > source.index) index -= 1
  }
  const [moved] = from.items().splice(source.index, 1)
  to.items().splice(index, 0, moved)
}

// Pixels the pointer moves before a press on a handle becomes a drag: a mere click on the
// handle (to focus it and move with the keyboard) must not start one.
const DRAG_THRESHOLD = 4
// Distance to the top or bottom of the window from which the page scrolls along.
const SCROLL_EDGE = 80

/**
 * Starts dragging the item `index` of `list` from a press on its handle. Nothing moves in
 * the page while dragging: `BlocsDragLayer` shows where the item will land, and the item
 * moves once, when it is dropped. Escape cancels.
 */
export function startBlocsDrag(event: PointerEvent, source: DragStart) {
  if (event.button !== 0) return
  const element = itemElements(source.list)[source.index]
  if (!element) return
  // Otherwise the browser may start a text selection or a native drag from the press, and
  // cancel the pointer (`pointercancel`) when it takes over.
  event.preventDefault()
  const fullSource: DragSource = { ...source, element }
  const startX = event.clientX
  const startY = event.clientY
  let pointerY = startY
  let scrollFrame: number | null = null

  const scroll = () => {
    const speed = pointerY < SCROLL_EDGE
      ? -(SCROLL_EDGE - pointerY) / 4
      : pointerY > window.innerHeight - SCROLL_EDGE ? (pointerY - window.innerHeight + SCROLL_EDGE) / 4 : 0
    if (speed && blocsDrag.value) {
      window.scrollBy(0, speed)
      blocsDrag.value = { ...blocsDrag.value, target: resolveTarget(fullSource, blocsDrag.value.x, blocsDrag.value.y) }
    }
    scrollFrame = requestAnimationFrame(scroll)
  }

  const onMove = (moveEvent: PointerEvent) => {
    if (!blocsDrag.value) {
      if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < DRAG_THRESHOLD) return
      document.documentElement.dataset.blocsDragging = ''
      element.dataset.dragSource = ''
      scrollFrame = requestAnimationFrame(scroll)
    }
    moveEvent.preventDefault()
    pointerY = moveEvent.clientY
    blocsDrag.value = {
      source: fullSource,
      x: moveEvent.clientX,
      y: moveEvent.clientY,
      target: resolveTarget(fullSource, moveEvent.clientX, moveEvent.clientY),
    }
  }

  const end = (dropped: boolean) => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onCancel)
    window.removeEventListener('keydown', onKeydown)
    if (scrollFrame !== null) cancelAnimationFrame(scrollFrame)
    delete document.documentElement.dataset.blocsDragging
    delete element.dataset.dragSource
    const state = blocsDrag.value
    blocsDrag.value = null
    if (dropped && state) drop(state)
  }
  const onUp = () => end(true)
  const onCancel = () => end(false)
  const onKeydown = (keyEvent: KeyboardEvent) => {
    if (keyEvent.key === 'Escape') end(false)
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onCancel)
  window.addEventListener('keydown', onKeydown)
}

// The keyboard alternative to dragging, from the focused handle: within the item's list.
export function moveWithKeyboard(items: unknown[], event: KeyboardEvent, index: number) {
  const direction = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[event.key]
  if (!direction) return
  event.preventDefault()
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= items.length) return
  const [moved] = items.splice(index, 1)
  items.splice(newIndex, 0, moved)
  // Moving an item up, Vue moves its element in the page, which drops the focus of its handle:
  // give it back, so that the next press moves it again.
  const handle = event.currentTarget as HTMLElement
  nextTick(() => handle.focus())
}
