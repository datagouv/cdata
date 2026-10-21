import { toast, type Site } from '@datagouv/components-next'
import type { PageBloc } from '~/types/pages'

type SiteBlocsKey = 'datasets_blocs' | 'reuses_blocs' | 'dataservices_blocs'

export async function useSiteBlocs(siteKey: SiteBlocsKey, extraFields: string[] = []) {
  const { $api } = useNuxtApp()
  const { t } = useTranslation()

  const fields = [siteKey, ...extraFields].join(',')
  const { data: site, refresh } = await useAPI<Site>('/api/1/site/', {
    // Keyed by the fields asked for: two pages asking for different ones must not share the
    // cached response, which would lack what one of them reads.
    key: `site-${fields}`,
    headers: { 'X-Fields': `{${fields}}` },
  })

  const blocs = computed(() => site.value?.[siteKey] ?? [])

  async function saveBlocs(updatedBlocs: Array<PageBloc>) {
    try {
      await $api('/api/1/site/', {
        method: 'PATCH',
        body: { [siteKey]: updatedBlocs },
      })
      await refresh()
      toast.success(t('Page sauvegardée'))
    }
    catch {
      toast.error(t('Erreur lors de la sauvegarde'))
    }
  }

  return { site, blocs, saveBlocs, refresh }
}
