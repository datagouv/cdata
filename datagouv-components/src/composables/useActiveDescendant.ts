import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import type { CommonKeyboardKeys } from '../types/keyboard'

export type Option = {
  id: string
}

export function useActiveDescendant<T extends Option>(options: MaybeRefOrGetter<Array<T>>, direction: 'horizontal' | 'vertical') {
  const active = ref<string | undefined>()

  const activeOption = computed<T | undefined>(() => toValue(options).find(option => option.id === active.value))

  function isActive(id: string | undefined) {
    return active.value === id
  }

  function activate(id?: string) {
    if (id === undefined) {
      return activateAtPosition(0)
    }
    active.value = id
  }

  function focusOut() {
    active.value = undefined
  }

  function activateAtPosition(position: number) {
    const optionsList = toValue(options)
    if (optionsList[position]) {
      activate(optionsList[position].id)
    }
  }

  function activateNextOption() {
    let activePosition = 0
    if (active.value) {
      activePosition = toValue(options).findIndex(option => option.id === active.value)
      activePosition++
      if (activePosition === toValue(options).length) {
        activePosition = 0
      }
    }
    activateAtPosition(activePosition)
  }

  function activatePreviousOption() {
    const lastOptionPosition = toValue(options).length - 1
    let activePosition = lastOptionPosition
    if (active.value) {
      activePosition = toValue(options).findIndex(option => option.id === active.value)
      activePosition--
      if (activePosition < 0) {
        activePosition = lastOptionPosition
      }
    }
    activateAtPosition(activePosition)
  }

  function handleKeyPressForActiveDescendant(key: KeyboardEvent, alreadyMovedDown = false) {
    switch (key.key as CommonKeyboardKeys) {
      case 'ArrowDown':
        if (direction === 'vertical' && !alreadyMovedDown && !key.altKey) {
          activateNextOption()
        }
        break
      case 'ArrowUp':
        if (direction === 'vertical') {
          activatePreviousOption()
        }
        break
      case 'ArrowLeft':
        if (direction === 'horizontal') {
          activatePreviousOption()
        }
        break
      case 'ArrowRight':
        if (direction === 'horizontal' && !alreadyMovedDown && !key.altKey) {
          activateNextOption()
        }
        break
      case 'Home':
      case 'End':
      case 'Escape':
        focusOut()
        break
    }
  }

  const ALREADY_MOVED_DOWN = true
  const NOT_MOVED_YET = false

  return {
    activate,
    active,
    activeOption,
    isActive,
    focusOut,
    handleKeyPressForActiveDescendant,
    ALREADY_MOVED_DOWN,
    NOT_MOVED_YET,
  }
}
