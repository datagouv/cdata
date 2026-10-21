import Sortable, { type SortableEvent } from 'sortablejs'

// The array each sortable list element renders, so that an item dropped in another list
// can be moved between the two arrays.
const listItems = new WeakMap<HTMLElement, () => unknown[]>()

type SortableOptions = {
  // Lists of the same group exchange their items (e.g. every grid cell of the page).
  group: string
  // Refuses to receive an item: its element and the list element receiving it.
  accepts?: (item: HTMLElement, list: HTMLElement) => boolean
}

/**
 * Sorts the items of a list with a drag handle (`[data-drag-handle="<group>"]`), and moves
 * them to the other lists of the same group. Items are the children marked with
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

    listItems.set(el, items)
    sortableInstance = Sortable.create(el, {
      animation: 150,
      ghostClass: 'opacity-50',
      draggable: '[data-sortable-item]',
      handle: `[data-drag-handle="${options.group}"]`,
      group: {
        name: options.group,
        put: (to, _from, dragEl) => !options.accepts || options.accepts(dragEl, to.el),
      },
      onEnd: (evt: SortableEvent) => {
        const oldIndex = evt.oldDraggableIndex
        const newIndex = evt.newDraggableIndex
        if (oldIndex === undefined || newIndex === undefined) return
        if (evt.from === evt.to && oldIndex === newIndex) return
        const from = listItems.get(evt.from)
        const to = listItems.get(evt.to)
        if (!from || !to) return

        // Vue owns the DOM: put the element back where Sortable took it, then move the
        // data and let Vue render the result.
        evt.from.insertBefore(evt.item, evt.from.children[evt.oldIndex!] ?? null)
        const [moved] = from().splice(oldIndex, 1)
        to().splice(newIndex, 0, moved)
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
