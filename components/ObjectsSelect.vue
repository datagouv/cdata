<template>
  <fieldset
    class="fr-fieldset"
    :aria-labelledby="mainLabel ? legendId : undefined"
  >
    <legend
      v-if="mainLabel"
      :id="legendId"
      class="fr-fieldset__legend"
    >
      <h2 class="text-sm font-bold uppercase mb-3">
        {{ mainLabel }}
      </h2>
    </legend>
    <div
      v-if="selected.length"
      ref="sortableRoot"
      class="w-full mb-8 space-y-4"
    >
      <div
        v-for="(object, index) in selected"
        :key="object.id"
        class="flex items-center space-x-2"
      >
        <div
          v-if="! single && allowReorder"
          class="shrink-0"
        >
          <BrandedButton
            color="primary-softer"
            :title="t('Faites glisser pour déplacer ce contenu')"
            :icon="RiDraggable"
            size="lg"
            keep-margins-even-without-borders
          />
        </div>
        <slot
          v-if="object.id in objectsByIds"
          :object="objectsByIds[object.id]"
        />
        <div class="shrink-0">
          <BrandedButton
            color="primary-softer"
            :title="t('Supprimer {objectType}', { objectType: theLabel })"
            :icon="RiDeleteBinLine"
            size="lg"
            keep-margins-even-without-borders
            @click="remove(index)"
          />
        </div>
      </div>
    </div>

    <div
      v-if="!selectedSuggest.length || !single"
      class="fr-fieldset__element"
    >
      <SearchableSelect
        v-model="selectedSuggest"
        :label="$t('Rechercher {objectType}', { objectType: aLabel })"
        :placeholder="$t('Rechercher {objectType}…', { objectType: aLabel })"
        class="mb-6"
        :suggest
        :multiple="true"
      >
        <template #option="{ option }">
          <slot
            name="option"
            :option
          >
            <div class="flex items-center space-x-2">
              <NuxtImg
                v-if="objectImageUrl && objectImageUrl(option)"
                :src="objectImageUrl(option)"
                alt=""
                loading="lazy"
                class="size-5 rounded-full"
              />
              <span>{{ option.title }}</span>
            </div>
          </slot>
        </template>
      </SearchableSelect>
      <Divider>{{ $t('ou') }}</Divider>
      <form
        class="flex items-end space-x-4"
        @submit.prevent="loadByLink"
      >
        <InputGroup
          v-model="datasetUrl"
          :label="t('Lien vers {objectType}', { objectType: theLabel })"
          :placeholder="'https://...'"
          :has-error="!!urlError"
          :error-text="urlError"
          class="w-full !mb-0"
        />
        <BrandedButton
          type="submit"
          :icon="RiAddLine"
          size="sm"
          :title="t('Ajouter {objectType}', { objectType: theLabel })"
        />
      </form>
    </div>
  </fieldset>
</template>

<script setup lang="ts" generic="T extends { id: string, title: string }, TSuggest extends { id: string, title: string }">
import { BrandedButton } from '@datagouv/components-next'
import { RiAddLine, RiDeleteBinLine, RiDraggable } from '@remixicon/vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import SearchableSelect from '~/components/SearchableSelect.vue'

const props = withDefaults(defineProps<{
  single?: boolean
  mainLabel?: string
  theLabel: string
  aLabel: string
  thisLabel: string
  allowReorder?: boolean
  objectImageUrl?: (object: T | TSuggest) => string
  suggest: (query: Record<string, string | number>) => Promise<Array<TSuggest>>
  fetch: (id: string) => Promise<T>
  isFullObject: (object: T | TSuggest) => T | null
  matchUrl: RegExp
}>(), {
  single: false,
  allowReorder: true,
})

const legendId = useId()

const sortableRootRef = useTemplateRef('sortableRoot')
const objectsByIds = ref<Record<string, T>>({})

const selectedSuggest = defineModel<Array<T | TSuggest>>({ required: true })
const datasetUrl = ref('')
const urlError = ref<string | null>(null)
useSortable(sortableRootRef, selectedSuggest)

const { t } = useTranslation()
const config = useRuntimeConfig()

const suggest = async (query: string): Promise<Array<TSuggest>> => {
  return await props.suggest({
    q: query,
    size: 5,
  })
}

watch(selectedSuggest, async () => {
  for (const object of selectedSuggest.value) {
    if (object.id in objectsByIds.value) continue

    const fullObject = props.isFullObject(object)
    if (fullObject) {
      objectsByIds.value[object.id] = fullObject
    }
    else {
      objectsByIds.value[object.id] = await props.fetch(object.id)
    }
  }
}, { immediate: true })

const selected = computed<Array<T | TSuggest>>(() => {
  return selectedSuggest.value.map((datasetSuggest) => {
    return objectsByIds.value[datasetSuggest.id] || null
  }).filter(object => object)
})

const loadByLink = async () => {
  try {
    const url = new URL(datasetUrl.value)
    if (!url.hostname.endsWith(`.${config.public.baseDomain}`)) {
      urlError.value = t('Veuillez fournir un lien vers la plateforme {title}. Nous ne pouvons pas lier une API avec {objectType} externe.', { objectType: props.aLabel, title: config.public.title })
      return
    }
  }
  catch {
    // Do nothing
  }

  const matches = props.matchUrl.exec(datasetUrl.value)
  if (!matches) {
    urlError.value = t(`L'URL fournie ne ressemble pas à une URL d'{objectType}.`, { objectType: props.aLabel })
    return
  }
  const id = matches[1]
  try {
    const fullObject = await props.fetch(id)
    if (selectedSuggest.value.find(suggest => suggest.id === fullObject.id)) {
      urlError.value = t('{objectType} est déjà présent dans la liste.', { objectType: capitalizeFirstLetter(props.thisLabel) })
      return
    }

    objectsByIds.value[fullObject.id] = fullObject
    selectedSuggest.value.push(fullObject)
    urlError.value = null
    datasetUrl.value = ''
  }
  catch {
    urlError.value = t(`Impossible de trouver {objectType} avec l'identifiant {id}.`, { id, objectType: props.aLabel })
  }
}

function remove(index: number) {
  selectedSuggest.value.splice(index, 1)
};
</script>
