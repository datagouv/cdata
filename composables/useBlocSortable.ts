import Sortable, { type SortableEvent } from 'sortablejs'

type SortableList = {
  items: () => unknown[]
  group: string
  receive?: (item: unknown, fromGroup: string) => unknown[]
}

// What each sortable list element renders, so that an item dropped in another list can be
// moved between the two arrays.
const lists = new WeakMap<HTMLElement, SortableList>()

type SortableOptions = {
  // Lists of the same group exchange their items as they are (e.g. every grid cell of the
  // page). Lists of other groups only send theirs when `accepts` lets them in.
  group: string
  // Refuses to receive an item: its element and the list element receiving it.
  accepts?: (item: HTMLElement, list: HTMLElement) => boolean
  // Turns an item of another group into the items of this list (e.g. a bloc into a cell).
  receive?: (item: unknown, fromGroup: string) => unknown[]
}

/**
 * Sorts the items of a list with a drag handle (`[data-drag-handle="<group>"]`), and moves
 * them to the other lists that accept them. Items are the children marked with
 * `data-sortable-item`; the handle is a button, moving its item with the arrow keys
 * (see `moveWithKeyboard`).
 */
export function useBlocSortable<T>(items: () => T[], edit: Ref<boolean>, options: SortableOptions) {
  const sortableRef = ref<HTMLElement | null>(null)
  let sortableInstance: Sortable | null = null

  watch([sortableRef, edit], ([el, isEditing]) => {
    sortableInstance?.destroy()
    sortableInstance = null

    if (!el || !isEditing) return

    lists.set(el, { items, group: options.group, receive: options.receive })
    sortableInstance = Sortable.create(el, {
      animation: 150,
      ghostClass: 'opacity-50',
      // Mouse/touch events rather than the native drag and drop, which behaves differently
      // across browsers with nested lists. The dragged copy goes on the body so that a
      // cell or a section does not clip it.
      forceFallback: true,
      fallbackOnBody: true,
      draggable: '[data-sortable-item]',
      handle: `[data-drag-handle="${options.group}"]`,
      group: {
        name: options.group,
        put: (to, from, dragEl) => {
          const source = lists.get(from.el)
          if (source?.group !== options.group && !options.receive) return false
          return !options.accepts || options.accepts(dragEl, to.el)
        },
      },
      onEnd: (evt: SortableEvent) => {
        const oldIndex = evt.oldDraggableIndex
        const newIndex = evt.newDraggableIndex
        if (oldIndex === undefined || newIndex === undefined) return
        if (evt.from === evt.to && oldIndex === newIndex) return
        const from = lists.get(evt.from)
        const to = lists.get(evt.to)
        if (!from || !to) return

        // Vue owns the DOM: put the element back where Sortable took it, then move the
        // data and let Vue render the result.
        evt.from.insertBefore(evt.item, evt.from.children[evt.oldIndex!] ?? null)
        const [moved] = from.items().splice(oldIndex, 1)
        const received = from.group === to.group || !to.receive ? [moved] : to.receive(moved, from.group)
        to.items().splice(newIndex, 0, ...received)
      },
    })
  }, { immediate: true })

  onUnmounted(() => {
    sortableInstance?.destroy()
    sortableInstance = null
  })

  function moveWithKeyboard(event: KeyboardEvent, index: number) {
    const direction = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[event.key]
    if (!direction) return
    event.preventDefault()
    const list = items()
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= list.length) return
    const [moved] = list.splice(index, 1)
    list.splice(newIndex, 0, moved)
  }

  return { sortableRef, moveWithKeyboard }
}
