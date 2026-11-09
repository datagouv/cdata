import type { ComponentPublicInstance, Ref } from 'vue'
import { autoUpdate, flip, offset, shift, size, useFloating, type Placement } from '@floating-ui/vue'

// The room a menu has: the window, without the save bar of the editor fixed at its bottom.
function padding() {
  const saveBar = document.querySelector('[data-blocs-save-bar]')?.getBoundingClientRect().height ?? 0
  return { top: 8, right: 8, bottom: saveBar + 8, left: 8 }
}

/**
 * Places a menu of the blocs editor next to its button: on the `placement` side, or the
 * opposite one when there is more room there, scrolling when it is taller than the room it
 * has, and never under the save bar.
 */
export function useEditorMenu(button: Ref<ComponentPublicInstance | null>, menu: Ref<ComponentPublicInstance | null>, placement: Placement) {
  const { floatingStyles } = useFloating(button, menu, {
    placement,
    strategy: 'fixed',
    // Positioned by its offsets: its opening transition scales it with `transform`.
    transform: false,
    middleware: [
      offset(8),
      flip(() => ({ padding: padding() })),
      shift(() => ({ padding: padding() })),
      size(() => ({
        padding: padding(),
        apply({ availableHeight, elements }) {
          elements.floating.style.maxHeight = `${Math.max(availableHeight, 160)}px`
        },
      })),
    ],
    // Follows its button at every frame while open: the page can move under it without
    // scrolling or resizing, as an image above loads.
    whileElementsMounted: (reference, floating, update) => autoUpdate(reference, floating, update, { animationFrame: true }),
  })
  return floatingStyles
}
