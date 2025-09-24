import { useTranslation } from '~/composables/useTranslation'

export default defineNuxtPlugin(() => {
  const { t } = useTranslation()

  return {
    provide: {
      t,
    },
  }
})
