<template>
  <div class="space-y-5">
    <BannerAction
      type="primary"
      :title="newExplorerEnabled ? $t('Vous testez la nouvelle navigation dans les ressources') : $t('Une nouvelle navigation dans les ressources est disponible')"
    >
      <template #button>
        <div class="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          <a
            v-if="newExplorerEnabled && feedbackUrl"
            :href="feedbackUrl"
            target="_blank"
            rel="noopener"
            class="fr-link fr-reset-link shrink-0"
          >{{ $t("Donner votre avis") }}</a>
          <BrandedButton
            size="xs"
            @click="toggleExplorer"
          >
            {{ newExplorerEnabled ? $t("Revenir sur l'ancienne navigation") : $t("Tester la nouvelle navigation") }}
          </BrandedButton>
        </div>
      </template>
    </BannerAction>

    <ResourceExplorer
      v-if="newExplorerEnabled"
      :dataset
      :explore-to="exploreTo"
      no-results-image="/illustrations/dataset.svg"
    />
    <DatasetsLegacyResourceList
      v-else
      :dataset
    />

    <RecommendationsDatasets :dataset />
  </div>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton, ResourceExplorer, type DatasetV2, type Resource } from '@datagouv/components-next'

const props = defineProps<{ dataset: DatasetV2 }>()

const route = useRoute()

// Feedback form link for the banner; only shown when configured.
const feedbackUrl = useRuntimeConfig().public.explorerFeedbackUrl

// Opens the fullscreen explorer on the current resource, next to the download button.
// Slug rather than id, so the explorer doesn't answer with a canonical redirect.
const exploreTo = (resource: Resource) => `/explore/${props.dataset.slug}?resource_id=${resource.id}`

const { enabled: newExplorerEnabled, setEnabled } = useNewExplorer()

const router = useRouter()

// Toggling the reactive flag swaps the explorer in place (no reload). Going back
// to the old navigation drops ?resource_id: it doesn't carry the same meaning there.
function toggleExplorer() {
  const enable = !newExplorerEnabled.value
  setEnabled(enable)
  if (!enable && route.query.resource_id) {
    const { resource_id: _, ...query } = route.query
    router.replace({ query })
  }
}

// A resource selected via ?resource_id duplicates content from the main dataset page,
// so it must stay out of the search index. Kept at the page level (not in a child
// component) so it applies whichever explorer renders the resources.
const hasResourceId = computed(() => 'resource_id' in route.query && route.query.resource_id)
if (import.meta.server && hasResourceId.value) {
  useSeoMeta({
    robots: 'noindex',
  })
}
</script>
