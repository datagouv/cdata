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

  const { data: org, refresh } = await useAPI<Pick<Organization, 'blocs' | 'blocs_published_at'>>(`/api/1/organizations/${organization.id}/`, {
    key: `org-blocs-${organization.id}`,
    headers: { 'X-Fields': '{blocs,blocs_published_at}' },
  })

  const blocs = computed(() => org.value?.blocs ?? [])

  // Publication date of the blocs (mirrors the back model):
  // - null  → draft, never visible to the public
  // - past  → published, publicly visible
  // - future → scheduled, public once the date is reached
  // Admins always receive the blocs regardless of this date, so the front uses it
  // to surface the draft/scheduled/published status and drive publish controls.
  const publishedAt = computed(() => org.value?.blocs_published_at ?? null)
  const isPublished = computed(() => isOrganizationPresentationPublished(publishedAt.value))

  // Save the blocs and their publication state in one request. `published` toggles
  // public visibility: keep the existing publication date when already published,
  // stamp now when newly publishing, clear it to go back to a draft.
  //
  // We do NOT catch errors here: the global API error handler already surfaces the
  // detailed message (a second generic toast would just hide it), and letting the
  // error propagate keeps the composer open with the unsaved edits instead of the
  // caller silently treating the save as successful.
  async function saveBlocs(updatedBlocs: Array<PageBloc>, published: boolean) {
    await updateOrganization({
      ...organization,
      blocs: updatedBlocs,
      blocs_published_at: published ? (publishedAt.value ?? new Date().toISOString()) : null,
    })
    await refresh()
    toast.success(t('Présentation sauvegardée'))
  }

  return { blocs, isPublished, saveBlocs, refresh }
}
