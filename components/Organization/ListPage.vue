<template>
  <h1 class="text-gray-title text-2xl font-extrabold !mb-2">
    {{ $t('Organisations') }}
  </h1>
  <label
    :for="inputId"
    class="block mb-3"
  >
    {{ $t('Rechercher parmi les {count} organisations sur {site}', {
      count: organizations.total,
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
      icon-only-on-mobile
      size="lg"
    >
      {{ $t('Rechercher') }}
    </BrandedButton>
  </div>
  <div class="flex justify-between items-center mb-6">
    <p class="mb-0">
      {{ $t('{count} résultats | {count} résultat | {count} résultats', { count: organizations.total }) }}
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
        <option value="-reuses">
          {{ $t('Réutilisations') }}
        </option>
      </select>
    </div>
  </div>
  <LoadingBlock
    v-slot="{ data: organizations }"
    :status
    :data="organizations"
  >
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-16">
      <OrganizationCard
        v-for="organization in organizations.data"
        :key="organization.id"
        class="min-w-0"
        :organization
      />
    </div>
  </LoadingBlock>
  <Pagination
    :page="organizations.page"
    :page-size="organizations.page_size"
    :total-results="organizations.total"
    :link="link"
    @change="(p: number) => $emit('change', q, sortParam, p)"
  />
</template>

<script setup lang="ts">
import { BrandedButton, LoadingBlock, OrganizationCard, Pagination } from '@datagouv/components-next'
import type { Organization } from '@datagouv/components-next'
import { RiSearch2Line } from '@remixicon/vue'
import { debouncedRef } from '@vueuse/core'
import type { PaginatedArray, RequestStatus } from '~/types/types'

const props = defineProps<{
  /**
   * Customize the links used
   */
  link?: (page: number) => string

  /**
   * List of organizations to show
   */
  organizations: PaginatedArray<Organization>

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
}>()

const emit = defineEmits<{
  change: [q: string, sort: string | undefined, page: number]
}>()

const config = useRuntimeConfig()

const inputId = useId()
const selectId = useId()

const q = ref('')
watchEffect(() => {
  q.value = props.initialQ
})

const qDebounced = debouncedRef(q, config.public.searchDebounce)
const sort = ref(props.sort ?? '')
const sortParam = computed(() => sort.value ? sort.value : undefined)

watch([sort, qDebounced], async ([_newSort, newQ]) => {
  emit('change', newQ, sortParam.value, 1)

  document.children[0].scrollIntoView({ behavior: 'smooth', block: 'start' })
})
</script>
