import { loadCurrentTranslations, useTranslation } from '@datagouv/components-next'

export default defineNuxtPlugin(async () => {
  const { t } = useTranslation()

  // Load the current locale in global state.
  await loadCurrentTranslations()

  return {
    provide: { t },
  }
})
