import { useTranslation } from '~/composables/useTranslation'

export default defineNuxtPlugin(async () => {
  const { t } = await useTranslation()

  return {
    provide: {
      t,
    },
  }
})
