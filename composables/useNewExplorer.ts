// Feature flag for the new resource navigation: ?new_explorer=1 to enable,
// ?new_explorer=0 to disable, persisted in a cookie.
//
// Shared state rather than a plain `useCookie`: the flag is read both by the dataset
// page shell (which hides its header "Explorer" button when the new explorer provides
// its own) and by the resources tab that toggles it. `useCookie` hands out an
// independent ref per call, so one of the two would keep a stale value until reload.
export function useNewExplorer() {
  const route = useRoute()
  const cookie = useCookie('new_explorer', { maxAge: 60 * 60 * 24 * 7, path: '/' })

  // useCookie uses `destr` which deserializes '1' as the number 1
  const enabled = useState('new-explorer', () => String(cookie.value) === '1')

  function setEnabled(value: boolean) {
    enabled.value = value
    cookie.value = value ? '1' : null
  }

  const queryFlag = route.query.new_explorer as string | undefined
  if (queryFlag === '1' || queryFlag === '0') {
    setEnabled(queryFlag === '1')
  }

  return { enabled, setEnabled }
}
