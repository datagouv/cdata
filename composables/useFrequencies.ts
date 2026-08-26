import type { Frequency } from '@datagouv/components-next'

/**
 * Frequencies for the update frequency selects.
 *
 * The API exposes the whole European vocabulary, which is useful for harvested
 * datasets but too granular for producers publishing directly here. The ones
 * listed in `mainFrequencies` are moved to the top of the list, in their
 * configured temporal order, and every other frequency follows in its own group.
 */
export async function useFrequencies() {
  const { t } = useTranslation()
  const mainIds = useRuntimeConfig().public.mainFrequencies

  const { data: allFrequencies } = await useAPI<Array<Frequency>>('/api/1/datasets/frequencies/', { lazy: true })

  const frequencies = computed<Array<Frequency>>(() => {
    const all = allFrequencies.value
    if (!all) return []

    const main = mainIds
      .map(id => all.find(frequency => frequency.id === id))
      .filter((frequency): frequency is Frequency => !!frequency)

    return [...main, ...all.filter(frequency => !mainIds.includes(frequency.id))]
  })

  const groupFrequency = (frequency: Frequency) => mainIds.includes(frequency.id)
    ? t('Fréquences principales')
    : t('Autres fréquences')

  return { frequencies, groupFrequency }
}
