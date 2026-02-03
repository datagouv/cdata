import { ref, readonly, watch, type Ref } from 'vue'

/**
 * Like VueUse's refDebounced but with a flush() method to force immediate sync.
 * Useful when resetting filters - no need to wait for debounce delay.
 */
export function useDebouncedRef<T>(source: Ref<T>, delay: number) {
  const debounced = ref(source.value) as Ref<T>
  const debouncedReadonly = readonly(debounced)
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(source, () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      debounced.value = source.value
      timeoutId = null
    }, delay)
  })

  function flush() {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    debounced.value = source.value
  }

  return { debounced: debouncedReadonly, flush }
}
