import { useIntervalFn } from '@vueuse/core'
import type { ComputedRef } from 'vue'

const POLL_INTERVAL_MS = 8000
// Push can span roughly two server-side poll timeouts (see udata/docs/geopf.md);
// this is a client-side ceiling, not a failure signal — the extras stay the
// source of truth, a manual reload still picks up the eventual terminal status.
const MAX_POLL_DURATION_MS = 5 * 60 * 1000

export function useGeopfPolling(pending: ComputedRef<boolean>, tick: () => Promise<void>) {
  const timedOut = ref(false)
  let elapsed = 0

  const { pause, resume, isActive } = useIntervalFn(async () => {
    elapsed += POLL_INTERVAL_MS
    if (elapsed >= MAX_POLL_DURATION_MS) {
      timedOut.value = true
      pause()
      return
    }
    await tick()
  }, POLL_INTERVAL_MS, { immediate: false })

  watch(pending, (isPending) => {
    if (isPending) {
      elapsed = 0
      timedOut.value = false
      resume()
    }
    else {
      pause()
    }
  }, { immediate: true })

  onUnmounted(() => pause())

  return { isPolling: isActive, timedOut }
}
