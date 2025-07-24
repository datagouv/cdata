import { RiDatabase2Line } from '@remixicon/vue'
import type { PageBloc } from '~/types/pages'

export function useBlocsTypes() {
  const { t } = useI18n()

  return {
    datasets_list: {
      icon: RiDatabase2Line,
      name: t('Données à la une'),
      description: t('Mettre en avant jusqu\'à 4 jeux de données'),
      default: (): Omit<PageBloc, 'id'> => ({ type: 'datasets_list', title: 'Mes jeux de données', subtitle: '', datasets: [] }),
    },
  }
}
