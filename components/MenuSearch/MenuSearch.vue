<template>
  <Combobox
    v-model="selectedItem"
    as="div"
    class="relative"
    nullable
  >
    <!--
      `nullable` is required here because otherwise the Combobox will set the active value on click outside
      See the listener here for the blur event https://github.com/tailwindlabs/headlessui/blob/%40headlessui/vue%40v1.7.23/packages/%40headlessui-vue/src/components/combobox/combobox.ts#L1250-L1252
      This is probably a bug in HeadlessUI https://github.com/tailwindlabs/headlessui/issues/3615
    -->
    <div
      class="relative w-full bg-white sm:text-sm"
    >
      <ComboboxInput
        class="w-full border-none bg-gray-lower rounded-tl py-2 px-4 text-base text-gray-plain focus:outline-offset-2 focus:outline-2 focus:outline-blue-outline shadow-input-blue placeholder:italic placeholder:text-gray-medium"
        :display-value="() => ''"
        :placeholder="$t('Recherche')"
        @change="query = $event.target.value"
      />
      <ComboboxButton
        class="absolute right-0 p-2 bg-new-primary rounded-tr hover:!bg-new-primary-hover"
      >
        <span class="sr-only">{{ $t('Rechercher') }}</span>
        <RiSearchLine
          class="h-6 w-6 text-white"
          aria-hidden="true"
        />
      </ComboboxButton>
    </div>
    <TransitionRoot
      leave="transition ease-in duration-100"
      leave-from="opacity-100"
      leave-to="opacity-0"
      class="absolute z-10 w-full"
      @after-leave="query = ''"
    >
      <ComboboxOptions
        class="list-none pl-0 text-left mt-1 mb-0 max-h-60 overflow-auto rounded-md bg-white text-base shadow-lg focus:outline-none sm:text-sm"
      >
        <ComboboxOption
          v-for="item in menu"
          :key="item.type"
          v-slot="{ active }"
          as="template"
          :value="item"
        >
          <li
            class="relative cursor-default select-none px-4 hover:bg-gray-some *:last:border-0"
            :class="{ 'text-datagouv': active }"
          >
            <div class="flex items-center space-x-2 border-b py-3">
              <component
                :is="item.icon"
                class="h-4 w-4"
              />
              <TranslationT
                v-if="query"
                keypath="Rechercher « {query} » dans les {type}"
                class="flex-1"
                tag="div"
              >
                <template #query>
                  <em>{{ query }}</em>
                </template>
                <template #type>
                  <strong>{{ item.type }}</strong>
                </template>
              </TranslationT>
              <TranslationT
                v-else
                keypath="Commencer à taper pour rechercher parmi les {type}"
                class="flex-1"
                tag="div"
              >
                <template #type>
                  <strong>{{ item.type }}</strong>
                </template>
              </TranslationT>
              <div aria-hidden="true">
                <RiArrowRightSLine class="h-4 w-4" />
              </div>
            </div>
          </li>
        </ComboboxOption>
        <ComboboxOption
          v-for="(suggestion, index) in suggestions"
          :key="`${suggestion.kind}-${suggestion.id}`"
          v-slot="{ active }"
          as="template"
          :value="suggestion"
        >
          <li
            class="relative cursor-default select-none px-4 hover:bg-gray-some *:last:border-0"
            :class="{ 'text-datagouv': active, 'border-t': index === 0 }"
          >
            <div class="flex items-center space-x-2 border-b py-3">
              <component
                :is="suggestionIcons[suggestion.kind]"
                class="h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <div class="flex-1 truncate">
                <span class="sr-only">{{ suggestionKindLabels[suggestion.kind] }} : </span>
                {{ suggestion.label }}
              </div>
              <div aria-hidden="true">
                <RiArrowRightSLine class="h-4 w-4" />
              </div>
            </div>
          </li>
        </ComboboxOption>
      </ComboboxOptions>
    </TransitionRoot>
  </Combobox>
</template>

<script setup lang="ts">
import { RiArrowRightSLine, RiDatabase2Line, RiBuilding2Line, RiLineChartLine, RiTerminalLine, RiSearchLine } from '@remixicon/vue'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, TransitionRoot } from '@headlessui/vue'
import type { Component } from 'vue'
import { refDebounced } from '@vueuse/core'
import { TranslationT, type OrganizationSuggest } from '@datagouv/components-next'
import type { DataserviceSuggest, DatasetSuggest, ReuseSuggest } from '~/types/types'
import { toSuggestions, type Suggestion, type SuggestionKind } from '~/utils/search'

type MenuItem = {
  icon: Component
  type: string
  to: string | { path: string, query: Record<string, string> }
}
type Item = MenuItem | Suggestion

const MIN_SUGGEST_LENGTH = 3

const emit = defineEmits<{
  selected: []
}>()

const { t } = useTranslation()
const config = useRuntimeConfig()
// Not `$api`: it toasts on 429/5xx, which would pile up in the header when the
// backend is degraded. Suggestions are best-effort and public, so fail silently.
const suggestFetch = $fetch.create({ baseURL: config.public.apiBase })
const query = ref('')
const queryDebounced = refDebounced(query, config.public.searchDebounce)
const selectedItem = ref<null | Item>(null)
const suggestions = ref<Array<Suggestion>>([])

const suggestionIcons: Record<SuggestionKind, Component> = {
  dataset: RiDatabase2Line,
  dataservice: RiTerminalLine,
  reuse: RiLineChartLine,
  organization: RiBuilding2Line,
}
const suggestionKindLabels = computed<Record<SuggestionKind, string>>(() => ({
  dataset: t('Jeu de données'),
  dataservice: t('API'),
  reuse: t('Réutilisation'),
  organization: t('Organisation'),
}))

watch(selectedItem, async () => {
  if (!selectedItem.value) return
  await navigateTo(selectedItem.value.to)
  suggestions.value = []
  emit('selected')
})

// Clear immediately (not after the debounce) so stale suggestions never
// linger under a query that is too short or was erased.
watch(query, (value) => {
  if (value.trim().length < MIN_SUGGEST_LENGTH) suggestions.value = []
})

watch(queryDebounced, async (raw) => {
  const q = raw.trim()
  if (q.length < MIN_SUGGEST_LENGTH) return

  const [datasets, dataservices, reuses, organizations] = await Promise.all([
    suggestFetch<Array<DatasetSuggest>>('/api/1/datasets/suggest/', { query: { q, size: 4 } }).catch(() => []),
    // The dataservices suggest endpoint may not exist yet, degrade gracefully
    suggestFetch<Array<DataserviceSuggest>>('/api/1/dataservices/suggest/', { query: { q, size: 3 } }).catch(() => []),
    suggestFetch<Array<ReuseSuggest>>('/api/1/reuses/suggest/', { query: { q, size: 3 } }).catch(() => []),
    suggestFetch<Array<OrganizationSuggest>>('/api/1/organizations/suggest/', { query: { q, size: 3 } }).catch(() => []),
  ])
  // Stale response: the user kept typing in the meantime.
  if (q !== query.value.trim()) return

  suggestions.value = toSuggestions({ datasets, dataservices, reuses, organizations })
})
const menu = computed(() => {
  return [
    {
      icon: RiDatabase2Line,
      type: t('jeux de données'),
      to: {
        path: '/datasets/search',
        query: { q: query.value.trim() },
      },
    },
    {
      icon: RiTerminalLine,
      type: t('API'),
      to: {
        path: '/dataservices/search',
        query: { q: query.value.trim() },
      },
    },
    {
      icon: RiLineChartLine,
      type: t('réutilisations'),
      to: {
        path: '/reuses/search',
        query: { q: query.value.trim() },
      },
    },
    {
      icon: RiBuilding2Line,
      type: t('organisations'),
      to: {
        path: '/organizations',
        query: { q: query.value.trim() },
      },
    },
  ]
})
</script>
