import { toast, type Organization, type PageBloc } from '@datagouv/components-next'
import { updateOrganization } from '~/api/organizations'

// Fetches and saves the editorial `presentation_blocs` of an organization.
// `presentation_blocs` is excluded from the default read mask, so we request it
// explicitly. It is a generic (polymorphic) field: flask-restx rejects a nested
// sub-mask like `{presentation_blocs{id}}` ("mask is inconsistent with model"), so
// we request the whole `{presentation_blocs}` field.
//
// The shared key lets the organization layout (tab visibility) and the presentation
// page reuse a single request instead of fetching the blocs twice.
export async function useOrganizationBlocs(organization: Organization) {
  const { t } = useTranslation()

  const { data: org, refresh } = await useAPI<Pick<Organization, 'presentation_blocs' | 'presentation_blocs_published_at'>>(`/api/1/organizations/${organization.id}/`, {
    key: `org-blocs-${organization.id}`,
    headers: { 'X-Fields': '{presentation_blocs,presentation_blocs_published_at}' },
  })

  const blocs = computed(() => org.value?.presentation_blocs ?? [])

  // Publication date of the blocs (mirrors the back model):
  // - null → draft, never visible to the public
  // - set  → published, publicly visible
  // Admins always receive the blocs regardless of this date, so the front uses it
  // to surface the draft/published status and drive publish controls.
  const publishedAt = computed(() => org.value?.presentation_blocs_published_at ?? null)
  const isPublished = computed(() => isOrganizationPresentationPublished(publishedAt.value))

  // Save the blocs and their publication state in one request. `published` toggles
  // public visibility: keep the existing publication date when already published,
  // stamp now when newly publishing, clear it to go back to a draft.
  //
  // We do NOT catch errors here: the global API error handler already surfaces the
  // detailed message (a second generic toast would just hide it), and letting the
  // error propagate keeps the composer open with the unsaved edits instead of the
  // caller silently treating the save as successful.
  // `refresh()` below updates this composer's own blocs view; the returned value is
  // the PUT response (full org, default mask) for callers that render it elsewhere.
  async function saveBlocs(updatedBlocs: Array<PageBloc>, published: boolean) {
    const updated = await updateOrganization({
      ...organization,
      presentation_blocs: updatedBlocs,
      presentation_blocs_published_at: published ? (publishedAt.value ?? new Date().toISOString()) : null,
    })
    await refresh()
    toast.success(t('Présentation sauvegardée'))
    return updated
  }

  return { blocs, isPublished, saveBlocs, refresh }
}
