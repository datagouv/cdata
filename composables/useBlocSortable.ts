import Sortable, { type MoveEvent, type SortableEvent } from 'sortablejs'

export function useBlocSortable<T>(items: Ref<T[]>, edit: Ref<boolean>) {
  let sortableInstance: Sortable | null = null

  function initSortable(el: HTMLElement | null) {
    if (!el) return

    if (!edit.value) {
      sortableInstance?.destroy()
      sortableInstance = null
      return
    }

    if (sortableInstance) return

    sortableInstance = Sortable.create(el, {
      animation: 150,
      ghostClass: 'opacity-50',
      filter: '.add-object-card',
      onMove: (evt: MoveEvent) => {
        if (evt.related?.classList.contains('add-object-card')) {
          return false
        }
        return true
      },
      onEnd: (evt: SortableEvent) => {
        if (evt.oldIndex === undefined || evt.newIndex === undefined) return
        if (evt.oldIndex === evt.newIndex) return

        const item = items.value.splice(evt.oldIndex, 1)[0]
        items.value.splice(evt.newIndex, 0, item)
      },
    })
  }

  onUnmounted(() => {
    sortableInstance?.destroy()
    sortableInstance = null
  })

  return { initSortable }
}
