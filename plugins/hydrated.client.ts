// Tells when the page reacts to input: until hydration ends, what is typed into a
// server-rendered field is lost and clicks reach no listener. The E2E tests wait for it,
// the network going idle being no proof of it on a busy CPU.
export default defineNuxtPlugin(() => {
  onNuxtReady(() => {
    document.documentElement.dataset.hydrated = 'true'
  })
})
