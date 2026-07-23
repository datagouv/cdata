<template>
  <div class="space-y-5">
    <SimpleBanner
      type="primary"
      class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
    >
      <div class="flex items-center gap-2">
        <RiInformationLine
          class="size-5 shrink-0"
          aria-hidden="true"
        />
        <button
          type="button"
          class="fr-link fr-reset-link text-left"
          @click="toggleExplorer"
        >
          {{ useNewExplorer ? $t("Revenir sur l'ancienne navigation") : $t("Tester la nouvelle navigation dans les ressources et notre nouvel explorateur") }}
        </button>
      </div>
      <a
        v-if="useNewExplorer && feedbackUrl"
        :href="feedbackUrl"
        target="_blank"
        rel="noopener"
        class="fr-link fr-reset-link shrink-0"
      >{{ $t("Donner votre avis") }}</a>
    </SimpleBanner>

    <ResourceExplorer
      v-if="useNewExplorer"
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
import { ResourceExplorer, SimpleBanner, type DatasetV2, type Resource } from '@datagouv/components-next'
import { RiInformationLine } from '@remixicon/vue'

const props = defineProps<{ dataset: DatasetV2 }>()

const route = useRoute()

// Feedback form link for the banner; only shown when configured.
const feedbackUrl = useRuntimeConfig().public.explorerFeedbackUrl

// Opens the fullscreen explorer on the current resource, next to the download button.
const exploreTo = (resource: Resource) => `/explore/${props.dataset.id}?resource_id=${resource.id}`

// Feature flag: ?new_explorer=1 to enable, ?new_explorer=0 to disable, persisted in cookie
const newExplorerCookie = useCookie('new_explorer', { maxAge: 60 * 60 * 24 * 7, path: '/' })
const queryFlag = route.query.new_explorer as string | undefined
if (queryFlag === '1') {
  newExplorerCookie.value = '1'
}
else if (queryFlag === '0') {
  newExplorerCookie.value = null
}
// useCookie uses `destr` which deserializes '1' as the number 1
const useNewExplorer = computed(() => String(newExplorerCookie.value) === '1')

const router = useRouter()

// Toggling the reactive cookie swaps the explorer in place (no reload). Going back
// to the old navigation drops ?resource_id: it doesn't carry the same meaning there.
function toggleExplorer() {
  const enable = !useNewExplorer.value
  newExplorerCookie.value = enable ? '1' : null
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
