<template>
  <fieldset
    class="fr-fieldset"
    aria-labelledby="reuses-legend"
  >
    <legend
      id="reuses-legend"
      class="fr-fieldset__legend"
    >
      <h2 class="text-sm font-bold uppercase mb-3">
        {{ label }}
      </h2>
    </legend>
    <div
      v-if="selectedReuses.length"
      ref="sortableRoot"
      class="w-full mb-8 space-y-4"
    >
      <div
        v-for="(reuse, index) in selectedReuses"
        :key="reuse.id"
        class="flex items-center space-x-2"
      >
        <div class="flex-1 border p-4">
          {{ reuse.title }}
        </div>
        <div class="shrink-0">
          <BrandedButton
            color="primary-softer"
            :title="t('Remove the reuse')"
            :icon="RiDeleteBinLine"
            size="lg"
            keep-margins-even-without-borders
            @click="removeReuse(index)"
          />
        </div>
      </div>
    </div>

    <div
      v-if="!selectedReusesSuggest.length || !single"
      class="fr-fieldset__element"
    >
      <SearchableSelect
        v-model="selectedReusesSuggest"
        :label="$t('Look for a reuse')"
        :placeholder="$t('Search a reuse…')"
        class="mb-6"
        :suggest="suggestReuse"
        :multiple="true"
      >
        <template #option="{ option: reuse }">
          <div class="flex items-center space-x-2">
            <NuxtImg
              :src="reuse.image_url"
              alt=""
              loading="lazy"
              class="size-5 rounded-full"
            />
            <span>{{ reuse.title }}</span>
          </div>
        </template>
      </SearchableSelect>
      <Divider>{{ $t('or') }}</Divider>
      <form
        class="flex items-end space-x-4"
        @submit.prevent="loadReuseByLink"
      >
        <InputGroup
          v-model="reuseUrl"
          :label="t('Link to the reuse')"
          :placeholder="'https://...'"
          :has-error="!!reuseUrlError"
          :error-text="reuseUrlError"
          class="w-full !mb-0"
        />
        <BrandedButton
          type="submit"
          :icon="RiAddLine"
          size="sm"
          :title="t('Add reuse')"
        />
      </form>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import type { Reuse } from '@datagouv/components-next'
import { RiAddLine, RiDeleteBinLine, RiDraggable } from '@remixicon/vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import ReuseCard from './Reuses/ReuseCard.vue'
import SearchableSelect from '~/components/SearchableSelect.vue'
import type { ReuseSuggest } from '~/types/types'

const props = withDefaults(defineProps<{
  single?: boolean
  label?: string
  allowReorder?: boolean
}>(), {
  single: false,
  allowReorder: true,
})

const sortableRootRef = useTemplateRef('sortableRoot')
const reusesById = ref<Record<string, Reuse>>({})

const selectedReusesSuggest = defineModel<Array<Reuse>>({ required: true })
const reuseUrl = ref('')
const reuseUrlError = ref<string | null>(null)
useSortable(sortableRootRef, selectedReusesSuggest)

const { t } = useI18n()
const { $api } = useNuxtApp()

const label = computed(() => props.label || t('Associated reuses'))

const suggestReuse = async (query: string): Promise<Array<ReuseSuggest>> => {
  return await $api<Array<ReuseSuggest>>('/api/1/reuses/suggest/', {
    query: {
      q: query,
      size: 5,
    },
  })
}

watchEffect(async () => {
  for (const reuse of selectedReusesSuggest.value) {
    if (reuse.id in reusesById.value) continue
    if ('resources' in reuse) {
      // It's already a full reuse
      reusesById.value[reuse.id] = reuse
    }
    else {
      reusesById.value[reuse.id] = await $api<Reuse>(`/api/1/reuses/${reuse.id}/`)
    }
  }
})

const selectedReuses = computed<Array<Reuse | ReuseSuggest>>(() => {
  return selectedReusesSuggest.value.map((reuseSuggest) => {
    return reusesById.value[reuseSuggest.id] || null
  }).filter(reuse => reuse)
})

const loadReuseByLink = async () => {
  const matches = /\/reuses\/(.+?)\/?$/.exec(reuseUrl.value)
  if (!matches) {
    reuseUrlError.value = t(`The provided URL doesn't look like a reuses URL.`)
    return
  }
  const id = matches[1]
  try {
    const reuse = await $api<Reuse>(`/api/1/reuses/${id}/`)
    if (selectedReusesSuggest.value.find(suggest => suggest.id === reuse.id)) {
      reuseUrlError.value = t('The reuse is already present in the list.')
      return
    }

    reusesById.value[reuse.id] = reuse
    selectedReusesSuggest.value.push(reuse)
    reuseUrlError.value = null
    reuseUrl.value = ''
  }
  catch {
    reuseUrlError.value = t('Cannot find a reuse identified by {id}.', { id })
  }
}

function removeReuse(index: number) {
  selectedReusesSuggest.value.splice(index, 1)
};
</script>
