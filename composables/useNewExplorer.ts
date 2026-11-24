// Feature flag for the new resource navigation, toggled from the banner on the resources
// tab and persisted in a cookie. On by default.
//
// Shared state rather than a plain `useCookie`: the flag is read both by the dataset
// page shell (which points its header "Explorer" button at one explorer or the other)
// and by the resources tab that toggles it. `useCookie` hands out an independent ref
// per call, so one of the two would keep a stale value until reload.
//
// The server ignores the cookie (the page cache isn't keyed on it); the opt-out applies
// client-side, once.
export function useNewExplorer() {
  const cookie = useCookie('new_explorer', { maxAge: 60 * 60 * 24 * 7, path: '/' })

  const enabled = useState('new-explorer', () => true)
  const cookieApplied = useState('new-explorer-cookie-applied', () => false)

  if (import.meta.client && !cookieApplied.value) {
    const applyCookie = () => {
      if (cookieApplied.value) return
      cookieApplied.value = true
      // useCookie reads it back as the string '0'
      enabled.value = String(cookie.value) !== '0'
    }
    if (useNuxtApp().isHydrating) onMounted(applyCookie)
    else applyCookie()
  }

  function setEnabled(value: boolean) {
    enabled.value = value
    cookie.value = value ? null : '0'
  }

  return { enabled, setEnabled }
}
