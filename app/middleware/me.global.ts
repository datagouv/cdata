export default defineNuxtRouteMiddleware(async (_to, _from) => {
  // console.log(`Calling me middleware ${from.path} -> ${to.path}`)
  const me = useMaybeMe()
  if (me.value !== undefined) {
    // console.log('Skipping since me in already set')
    return
  }

  await loadMe(me)
  // console.log('Me initted')
})
