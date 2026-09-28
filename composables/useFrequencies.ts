import type { Frequency } from '@datagouv/components-next'

/**
 * Frequencies for the update frequency selects.
 *
 * The API exposes the whole European vocabulary, which is useful for harvested
 * datasets but too granular for producers publishing directly here. The ones
 * listed in `commonFrequencies` are moved to the top of the list, in their
 * configured temporal order, and every other frequency follows in its own group.
 */
export async function useFrequencies() {
  const { t } = useTranslation()
  const commonIds = useRuntimeConfig().public.commonFrequencies

  const { data: allFrequencies } = await useAPI<Array<Frequency>>('/api/1/datasets/frequencies/', { lazy: true })

  const frequencies = computed<Array<Frequency>>(() => {
    const all = allFrequencies.value
    if (!all) return []

    const common = commonIds
      .map(id => all.find(frequency => frequency.id === id))
      .filter((frequency): frequency is Frequency => !!frequency)

    return [...common, ...all.filter(frequency => !commonIds.includes(frequency.id))]
  })

  const groupFrequency = (frequency: Frequency) => commonIds.includes(frequency.id)
    ? t('Fréquences courantes')
    : t('Autres fréquences')

  return { frequencies, groupFrequency }
}
