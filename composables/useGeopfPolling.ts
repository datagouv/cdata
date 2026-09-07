import { useIntervalFn } from '@vueuse/core'
import type { ComputedRef } from 'vue'

const POLL_INTERVAL_MS = 8000

// Polls for as long as a push or pull is pending. `useIntervalFn` pauses itself on
// scope dispose.
export function useGeopfPolling(pending: ComputedRef<boolean>, tick: () => Promise<void>) {
  const { pause, resume } = useIntervalFn(tick, POLL_INTERVAL_MS, { immediate: false })

  watch(pending, isPending => isPending ? resume() : pause(), { immediate: true })
}
