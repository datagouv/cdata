// Feature flag for the new resource navigation, toggled from the banner on the resources
// tab and persisted in a cookie.
//
// Shared state rather than a plain `useCookie`: the flag is read both by the dataset
// page shell (which points its header "Explorer" button at one explorer or the other)
// and by the resources tab that toggles it. `useCookie` hands out an independent ref
// per call, so one of the two would keep a stale value until reload.
export function useNewExplorer() {
  const cookie = useCookie('new_explorer', { maxAge: 60 * 60 * 24 * 7, path: '/' })

  // useCookie uses `destr` which deserializes '1' as the number 1
  const enabled = useState('new-explorer', () => String(cookie.value) === '1')

  function setEnabled(value: boolean) {
    enabled.value = value
    cookie.value = value ? '1' : null
  }

  return { enabled, setEnabled }
}
