<template>
  <SearchableSelect
    v-model="model"
    :options="[]"
    :suggest="loadOptions"
    :label="t('Organisations')"
    :placeholder="t('Toutes les organisations')"
    :get-option-id="(option) => option.id"
    :display-value="(option) => option.name"
    :multiple="false"
    :loading="loading"
    :refresh-key="optionsRefreshKey"
  >
    <template #option="{ option }">
      <div class="flex flex-1 min-w-0 items-center gap-2">
        <OrganizationLogo
          :organization="option"
          size-class="size-8"
          class="flex-none"
        />
        <span class="flex-1 truncate">{{ option.name }}</span>
        <span
          v-if="resultsNarrowed"
          class="flex-none text-sm text-gray-600 tabular-nums"
          data-testid="organization-option-count"
        >
          {{ option.count !== undefined ? formatCount(option.count) : '–' }}
        </span>
      </div>
    </template>
  </SearchableSelect>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ofetch } from 'ofetch'
import { useComponentsConfig } from '../../config'
import { useTranslation } from '../../composables/useTranslation'
import { useAsyncSelectModelSync } from '../../composables/useSelectModelSync'
import { resolveOrganizationOptions, type OrganizationOption } from '../../functions/organization-options'
import type { Organization, OrganizationSuggest } from '../../types/organizations'
import type { FacetItem, OrganizationSource } from '../../types/search'
import OrganizationLogo from '../OrganizationLogo.vue'
import SearchableSelect from './SearchableSelect.vue'

const model = defineModel<OrganizationOption | null>({ default: null })
const id = defineModel<string | undefined>('id')

const props = withDefaults(defineProps<{
  loading?: boolean
  /**
   * Facets of the current search results, used as the option list once those
   * results are narrowed down by a query or a filter.
   */
  facets?: FacetItem[]
  /**
   * Where the option list comes from. See `OrganizationSource`.
   */
  source?: OrganizationSource
  /**
   * Whether a query or a filter narrowed the current results down. Left to the
   * search component, which alone knows which filters are active.
   */
  resultsNarrowed?: boolean
}>(), {
  loading: false,
  source: 'facets-then-suggest',
  resultsNarrowed: false,
})

const config = useComponentsConfig()
const { t, locale } = useTranslation()

// The option list depends on the facets and on the narrowing, both of which change
// with the results rather than with what is typed in the select, so they are part of
// the refresh key: without it the list would keep whatever `loadOptions` returned on
// mount, long after the results were narrowed down. Facet counts are included so that
// a new result set always reloads, even when the organization list is unchanged.
const optionsRefreshKey = computed(() => JSON.stringify([
  props.source,
  props.resultsNarrowed,
  props.facets,
]))

function formatCount(count: number) {
  return new Intl.NumberFormat(locale, { notation: 'compact' }).format(count)
}

// Keyed on `id` rather than on the option list, so that the selected organization
// survives the facets being replaced: it is what keeps its name displayed once it
// drops out of the facet list, e.g. when it has no result left for the query.
// Deliberately not wired to the select's `loading`: a disabled combobox leaves the
// input out of the accessibility tree while the label is being resolved.
useAsyncSelectModelSync({
  model,
  id,
  getId: org => org.id,
  fetchById: orgId => ofetch<Organization>(`/api/1/organizations/${orgId}/`, { baseURL: config.apiBase }),
})

async function loadOptions(query: string): Promise<OrganizationOption[]> {
  return await resolveOrganizationOptions({
    query,
    source: props.source,
    resultsNarrowed: props.resultsNarrowed,
    facets: props.facets,
    suggest: fetchSuggestOrganizations,
  })
}

async function fetchSuggestOrganizations(q: string): Promise<OrganizationOption[]> {
  return await ofetch<OrganizationSuggest[]>('/api/1/organizations/suggest/', {
    baseURL: config.apiBase,
    query: {
      q,
      size: 20,
    },
  })
}
</script>
