<template>
  <h1 class="text-gray-title text-2xl font-bold mb-2">
    {{ $t('Réutilisations') }}
  </h1>
  <label
    :for="inputId"
    class="block mb-3"
  >
    {{ $t('Rechercher parmi les {count} réutilisations sur {site}', {
      count: totalReuses,
      site: config.public.title,
    }) }}
  </label>
  <div class="w-full flex mb-5">
    <input
      :id="inputId"
      v-model.trim="q"
      class="flex-1 px-4 py-2 bg-gray-lower rounded-tl-sm shadow-input-blue"
      type="search"
      :placeholder="$t('Rechercher...')"
    >
    <BrandedButton
      class="rounded-none rounded-tr"
      :icon="RiSearch2Line"
      size="lg"
    >
      {{ $t('Recherche') }}
    </BrandedButton>
  </div>
  <div class="fr-grid-row fr-mb-1v fr-displayed-lg">
    <ul class="fr-tags-group">
      <li>
        <button
          type="button"
          class="fr-tag"
          :aria-pressed="!topic"
          @click="topic = undefined"
        >
          {{ $t('Tout') }}
        </button>
      </li>
      <li
        v-for="currentTopic in topics"
        :key="currentTopic.id"
      >
        <button
          class="fr-tag"
          :aria-pressed="currentTopic.id === topic"
          @click="topic = currentTopic.id"
        >
          {{ currentTopic.label }}
        </button>
      </li>
    </ul>
  </div>
  <div class="flex justify-between items-center mb-6">
    <p class="mb-0">
      {{ $t('{count} résultats | {count} résultat | {count} résultats', { count: reuses.total }) }}
    </p>
    <div class="flex items-center gap-1">
      <label
        :for="selectId"
        class="flex-none text-sm"
      >{{ $t('Trier par :') }}</label>
      <select
        :id="selectId"
        v-model="sort"
        class="fr-select !shadow-input-blue"
      >
        <option value="">
          {{ $t('Pertinence') }}
        </option>
        <option value="-created">
          {{ $t('Les plus récents') }}
        </option>
        <option value="created">
          {{ $t('Les plus anciens') }}
        </option>
        <option value="-followers">
          {{ $t('Abonnés') }}
        </option>
      </select>
    </div>
  </div>
  <LoadingBlock :status>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-16">
      <ReuseCard
        v-for="reuse in reuses.data"
        :key="reuse.id"
        class="col-span-1"
        :reuse
      />
    </div>
  </LoadingBlock>
  <Pagination
    :page="reuses.page"
    :page-size="reuses.page_size"
    :total-results="reuses.total"
    :link="link"
    @change="(p: number) => $emit('change', q, topic, sortParam, p)"
  />
</template>

<script setup lang="ts">
import { BrandedButton, Pagination } from '@datagouv/components-next'
import type { Reuse, ReuseTopic } from '@datagouv/components-next'
import { RiSearch2Line } from '@remixicon/vue'
import { debouncedRef } from '@vueuse/core'
import ReuseCard from '~/components/Reuses/ReuseCard.vue'
import type { PaginatedArray, RequestStatus } from '~/types/types'

const props = defineProps<{
  /**
   * Customize the links used
   */
  link?: (page: number) => string

  /**
   * List of reuses to show
   */
  reuses: PaginatedArray<Reuse>

  /**
   * The starting q
   */
  initialQ: string

  /**
   * The starting sort
   */
  sort: string | undefined

  /**
   * The API request status
   */
  status: RequestStatus

  /**
   * The starting sort
   */
  topic: string | undefined

  /**
   * Reuse topics from API
   */
  topics: Array<ReuseTopic>

  /**
   * Number of reuses for this site or organization
   */
  totalReuses: number
}>()

const emit = defineEmits<{
  change: [q: string, topic: string | undefined, sort: string | undefined, page: number]
}>()

const config = useRuntimeConfig()

const inputId = useId()
const selectId = useId()

const q = ref('')
watchEffect(() => {
  q.value = props.initialQ
})

const qDebounced = debouncedRef(q, config.public.searchAutocompleteDebounce)
const sort = ref(props.sort ?? '')
const sortParam = computed(() => sort.value ? sort.value : undefined)
const topic = ref(props.topic)

watch([sort, topic, qDebounced], async ([_newSort, newTopic, newQ]) => {
  emit('change', newQ, newTopic, sortParam.value, 1)

  document.children[0].scrollIntoView({ behavior: 'smooth', block: 'start' })
})
</script>
