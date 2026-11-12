import { FetchError } from 'ofetch'

/**
 * The open state of a modal whose action requires a fresh session, kept in the URL as
 * `?<query>=<value>`: when udata asks for a reauthentication, the user is sent to /verify
 * with this URL as `next`, and comes back to the modal rather than to a page where they
 * would have to start again.
 *
 * `check` asks udata, before the modal shows, for something answered with a 401 when the
 * session must be reauthenticated: nothing typed in the modal is lost to the round-trip.
 * `pending` is true while udata answers, for the button to show it is working on it.
 */
export function useFreshSessionModal(query: string, value: string, check: () => Promise<void>) {
  const route = useRoute()
  const router = useRouter()
  const requested = computed(() => route.query[query] === value)
  const setRequested = (open: boolean) => router.replace({ query: { ...route.query, [query]: open ? value : undefined } })
  // Shown only once udata accepts the request, so that it does not flash before /verify.
  const shown = ref(false)
  const pending = ref(false)

  const show = async () => {
    pending.value = true
    try {
      await check()
    }
    catch (e) {
      // A 401 has already sent the user to /verify or /login, with this page's URL as
      // `next`: rewriting the query now would strip it from the new page. Any other error
      // leaves them here, so the request is dropped for the button to ask again.
      if (!(e instanceof FetchError) || e.statusCode !== 401) setRequested(false)
      return
    }
    finally {
      pending.value = false
    }
    shown.value = true
  }

  watch(requested, (value) => {
    if (value) show()
    else shown.value = false
  })
  onMounted(() => {
    if (requested.value) show()
  })

  const isOpen = computed({
    get: () => shown.value,
    set: (open: boolean) => {
      if (!open) shown.value = false
      setRequested(open)
    },
  })

  return { isOpen, pending: readonly(pending) }
}
