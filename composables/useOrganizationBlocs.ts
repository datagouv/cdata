import { toast, type Organization, type PageBloc } from '@datagouv/components-next'
import { updateOrganization } from '~/api/organizations'

// Fetches and saves the editorial `blocs` of an organization. `blocs` is excluded
// from the default read mask, so we request it explicitly. It is a generic
// (polymorphic) field: flask-restx rejects a nested sub-mask like `{blocs{id}}`
// ("mask is inconsistent with model"), so we request the whole `{blocs}` field.
//
// The shared key lets the organization layout (tab visibility) and the presentation
// page reuse a single request instead of fetching the blocs twice.
export async function useOrganizationBlocs(organization: Organization) {
  const { t } = useTranslation()

  const { data: org, refresh } = await useAPI<Pick<Organization, 'blocs'>>(`/api/1/organizations/${organization.id}/`, {
    key: `org-blocs-${organization.id}`,
    headers: { 'X-Fields': '{blocs}' },
  })

  const blocs = computed(() => org.value?.blocs ?? [])

  async function saveBlocs(updatedBlocs: Array<PageBloc>) {
    try {
      await updateOrganization({ ...organization, blocs: updatedBlocs })
      await refresh()
      toast.success(t('Présentation sauvegardée'))
    }
    catch {
      toast.error(t('Erreur lors de la sauvegarde'))
    }
  }

  return { blocs, saveBlocs, refresh }
}
