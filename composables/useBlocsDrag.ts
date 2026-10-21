// What is being dragged: a band of the page (section, hero), a bloc, a grid cell, or an
// accordion item. A cell carries the classes of its blocs, which is what decides where it
// can land.
export type DraggedKind = 'band' | 'bloc' | 'cell' | 'accordion-item'
export type Dragged = { kind: DraggedKind, classes: Array<string> }

type DropList = {
  // `horizontal` for the cells of a grid, laid out in rows; `vertical` for the others.
  orientation: 'vertical' | 'horizontal'
  items: () => unknown[]
  accepts: (dragged: Dragged) => boolean
  // Turns what is dropped into the items of this list (e.g. a bloc into a cell).
  receive: (item: unknown, dragged: Dragged) => unknown[]
}

type DragSource = Dragged & { list: HTMLElement, index: number, element: HTMLElement, label: string }

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
function place(listElement: HTMLElement, list: DropList, x: number, y: number): DropTarget {
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

  // Cells wrap in rows: those of the rows above, and those of the pointer's row on its left.
  const index = rects.filter(rect => rect.bottom < y || (rect.top <= y && rect.left + rect.width / 2 < x)).length
  const reference = rects[Math.min(index, rects.length - 1)]
  if (!reference) {
    return { list: listElement, index, line: { left: listRect.left, top: listRect.top, width: 2, height: listRect.height } }
  }
  // Half of the gap between two cells, on the side of the reference cell.
  const lineX = index < rects.length ? reference.left - 10 : reference.right + 10
  return { list: listElement, index, line: { left: lineX - 1, top: reference.top, width: 2, height: reference.height } }
}

// The innermost list under the pointer that accepts what is dragged; when it does not,
// its parent list, and so on. Never a list inside the dragged element itself.
function resolveTarget(source: DragSource, x: number, y: number): DropTarget | null {
  let listElement = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-drop-list]') ?? null
  while (listElement) {
    const list = dropLists.get(listElement)
    if (list && !source.element.contains(listElement) && list.accepts(source)) {
      return place(listElement, list, x, y)
    }
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
  const received = target.list === source.list ? [moved] : to.receive(moved, source)
  to.items().splice(index, 0, ...received)
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
export function startBlocsDrag(event: PointerEvent, source: Omit<DragSource, 'element'>) {
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
}
