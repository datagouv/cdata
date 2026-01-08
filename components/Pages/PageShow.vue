<template>
  <div>
    <div
      v-for="(bloc, index) in workingPage.blocs"
      :key="bloc.id"
      class="py-24 odd:bg-gray-some even:bg-white relative"
    >
      <!-- Bouton ajouter au-dessus du bloc (positionné en absolute) -->
      <div
        v-if="edit"
        class="absolute -top-4 left-0 right-0 flex items-center justify-center z-20"
      >
        <AddBlocDropdown @new-bloc="workingPage.blocs.splice(index, 0, $event)">
          <BrandedButton
            color="tertiary"
            size="xs"
            class="bg-white shadow-sm"
            :icon="RiAddLine"
          >
            {{ $t('Ajouter un bloc') }}
          </BrandedButton>
        </AddBlocDropdown>
      </div>
      <!-- Toolbar bloc en mode edit -->
      <div
        v-if="edit"
        class="absolute left-4 lg:left-8 xl:left-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10"
      >
        <BrandedButton
          color="tertiary"
          :icon="RiArrowUpLine"
          :disabled="index === 0"
          :title="$t('Monter')"
          @click="moveBloc(index, -1)"
        />
        <BrandedButton
          color="tertiary"
          :icon="RiArrowDownLine"
          :disabled="index === workingPage.blocs.length - 1"
          :title="$t('Descendre')"
          @click="moveBloc(index, 1)"
        />
        <BrandedButton
          color="tertiary"
          :icon="RiDeleteBinLine"
          :title="$t('Supprimer')"
          @click="workingPage.blocs.splice(index, 1)"
        />
      </div>

      <div class="container space-y-6">
        <div class="space-y-2.5">
          <!-- Titre éditable -->
          <EditableText
            v-if="edit"
            v-model="bloc.title"
            class="text-gray-title text-3xl font-extrabold"
          />
          <div
            v-else
            class="text-gray-title text-3xl font-extrabold"
          >
            {{ bloc.title }}
          </div>

          <!-- Sous-titre éditable -->
          <EditableText
            v-if="edit && bloc.subtitle"
            v-model="bloc.subtitle"
            class="text-gray-plain"
          />
          <div
            v-else-if="bloc.subtitle"
            class="text-gray-plain"
          >
            {{ bloc.subtitle }}
          </div>
          <button
            v-else-if="edit"
            class="text-gray-400 hover:text-gray-600 text-sm"
            @click="bloc.subtitle = 'Sous-titre'"
          >
            + {{ $t('Ajouter un sous-titre') }}
          </button>
        </div>

        <!-- DatasetsListBloc -->
        <div
          v-if="bloc.class === 'DatasetsListBloc'"
          :ref="el => initSortable(el as HTMLElement, bloc.datasets, edit)"
          class="grid sm:grid-cols-2 gap-5"
        >
          <div
            v-for="(dataset, i) in bloc.datasets"
            :key="dataset.id"
            class="relative"
            :class="{ 'cursor-grab active:cursor-grabbing': edit }"
          >
            <button
              v-if="edit"
              class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
              :title="$t('Supprimer')"
              @click="bloc.datasets.splice(i, 1)"
            >
              <RiDeleteBinLine class="size-5" />
            </button>
            <DatasetCardLg
              class="min-w-0"
              :dataset
            />
          </div>
          <!-- Card fantôme pour ajouter -->
          <AddObjectCard
            v-if="edit"
            :label="$t('Ajouter un jeu de données')"
            @click="openDatasetSelector(bloc)"
          />
        </div>

        <!-- DataservicesListBloc -->
        <div
          v-if="bloc.class === 'DataservicesListBloc'"
          :ref="el => initSortable(el as HTMLElement, bloc.dataservices, edit)"
          class="grid sm:grid-cols-2 gap-5"
        >
          <div
            v-for="(dataservice, i) in bloc.dataservices"
            :key="dataservice.id"
            class="relative"
            :class="{ 'cursor-grab active:cursor-grabbing': edit }"
          >
            <button
              v-if="edit"
              class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
              :title="$t('Supprimer')"
              @click="bloc.dataservices.splice(i, 1)"
            >
              <RiDeleteBinLine class="size-5" />
            </button>
            <DataserviceCard
              class="min-w-0"
              :dataservice
            />
          </div>
          <!-- Card fantôme pour ajouter -->
          <AddObjectCard
            v-if="edit"
            :label="$t('Ajouter une API')"
            @click="openDataserviceSelector(bloc)"
          />
        </div>

        <!-- ReusesListBloc -->
        <div
          v-if="bloc.class === 'ReusesListBloc'"
          :ref="el => initSortable(el as HTMLElement, bloc.reuses, edit)"
          class="grid sm:grid-cols-3 gap-5"
        >
          <div
            v-for="(reuse, i) in bloc.reuses"
            :key="reuse.id"
            class="relative"
            :class="{ 'cursor-grab active:cursor-grabbing': edit }"
          >
            <button
              v-if="edit"
              class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
              :title="$t('Supprimer')"
              @click="bloc.reuses.splice(i, 1)"
            >
              <RiDeleteBinLine class="size-5" />
            </button>
            <ReuseCard
              class="min-w-0"
              :reuse
            />
          </div>
          <!-- Card fantôme pour ajouter -->
          <AddObjectCard
            v-if="edit"
            :label="$t('Ajouter une réutilisation')"
            @click="openReuseSelector(bloc)"
          />
        </div>

        <!-- LinksListBloc -->
        <div
          v-if="bloc.class === 'LinksListBloc'"
          class="flex flex-col sm:flex-row gap-8 sm:gap-16"
        >
          <div
            v-if="bloc.paragraph"
            class="w-full"
          >
            <!-- Paragraph éditable -->
            <div
              v-if="edit"
              class="relative"
            >
              <button
                class="absolute -left-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                :title="$t('Supprimer le paragraphe')"
                @click="bloc.paragraph = null"
              >
                <RiDeleteBinLine class="size-5" />
              </button>
              <EditableText
                :model-value="bloc.paragraph ?? ''"
                tag="p"
                class="mb-0 font-light text-2xl"
                @update:model-value="bloc.paragraph = $event"
              />
            </div>
            <p
              v-else
              class="mb-0 font-light text-2xl"
            >
              {{ bloc.paragraph }}
            </p>

            <!-- Main link (dans la colonne de gauche quand paragraphe présent) -->
            <div
              v-if="edit"
              class="mt-12 space-y-2 relative"
            >
              <button
                v-if="bloc.main_link_title || bloc.main_link_url"
                class="absolute -left-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                :title="$t('Supprimer')"
                @click="bloc.main_link_title = ''; bloc.main_link_url = ''"
              >
                <RiDeleteBinLine class="size-5" />
              </button>
              <BrandedButton
                :color="mainColor"
                class="pointer-events-none"
              >
                <input
                  v-model="bloc.main_link_title"
                  type="text"
                  class="bg-transparent border-none outline-none text-inherit font-inherit pointer-events-auto"
                  :style="{ width: `${Math.max(10, bloc.main_link_title?.length || 0)}ch` }"
                  :placeholder="$t('Titre du bouton')"
                >
              </BrandedButton>
              <input
                v-model="bloc.main_link_url"
                type="text"
                class="block text-sm text-gray-500 border rounded px-2 py-1 w-full max-w-xs"
                :placeholder="$t('URL du bouton')"
              >
            </div>
            <BrandedButton
              v-else-if="bloc.main_link_title && bloc.main_link_url"
              :href="bloc.main_link_url"
              class="mt-12"
              :color="mainColor"
            >
              {{ bloc.main_link_title }}
            </BrandedButton>
          </div>
          <div class="space-y-8 w-full">
            <!-- Bouton pour ajouter un paragraphe quand il n'y en a pas -->
            <button
              v-if="edit && !bloc.paragraph"
              class="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm"
              @click="bloc.paragraph = 'Texte du paragraphe'"
            >
              <RiAddLine class="size-4" />
              {{ $t('Ajouter un paragraphe') }}
            </button>

            <div
              v-for="(link, i) in bloc.links"
              :key="i"
              class="relative group/link"
            >
              <!-- Mode affichage -->
              <template v-if="!edit">
                <CdataLink
                  class="hyphens-auto inline-flex items-start relative font-extrabold text-[var(--link-color)] no-underline hover:underline fr-raw-link"
                  :class="[bloc.paragraph ? 'text-6xl' : 'text-7xl']"
                  :style="{
                    '--link-color': link.color,
                  }"
                  :href="link.url"
                >
                  {{ link.title }}
                  <RiArrowRightUpLine class="size-9" />
                </CdataLink>
              </template>

              <!-- Mode édition -->
              <template v-else>
                <div class="space-y-2 relative">
                  <!-- Contrôles flottants à gauche -->
                  <div class="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
                    <input
                      v-model="link.color"
                      type="color"
                      class="size-6 rounded cursor-pointer border-0"
                    >
                    <button
                      class="text-gray-500 hover:text-gray-700"
                      :title="$t('Supprimer')"
                      @click="bloc.links.splice(i, 1)"
                    >
                      <RiDeleteBinLine class="size-5" />
                    </button>
                  </div>
                  <div
                    class="hyphens-auto inline-flex items-start font-extrabold"
                    :class="[bloc.paragraph ? 'text-6xl' : 'text-7xl']"
                    :style="{ color: link.color ?? '#000091' }"
                  >
                    <span
                      contenteditable="true"
                      class="outline-none focus:ring-2 focus:ring-blue-300 rounded min-w-[2ch] caret-current"
                      :style="{ color: link.title ? (link.color ?? '#000091') : '#9ca3af' }"
                      @blur="link.title = ($event.target as HTMLElement).textContent || ''"
                      @keydown.enter.prevent="($event.target as HTMLElement).blur()"
                      v-text="link.title || $t('Titre du lien')"
                    />
                    <RiArrowRightUpLine class="size-9 flex-shrink-0" />
                  </div>
                  <input
                    v-model="link.url"
                    type="text"
                    class="text-sm text-gray-500 border rounded px-2 py-1 max-w-xs"
                    :placeholder="$t('URL')"
                  >
                </div>
              </template>
            </div>

            <!-- Ajouter un lien -->
            <button
              v-if="edit"
              class="text-gray-400 hover:text-gray-600 flex items-center gap-1"
              @click="bloc.links.push({ title: '', url: '', color: '#000091' })"
            >
              <RiAddLine class="size-5" />
              {{ $t('Ajouter un lien') }}
            </button>

            <!-- Main button en mode édition (quand pas de paragraphe) -->
            <div
              v-if="edit && !bloc.paragraph"
              class="mt-4 space-y-2 relative"
            >
              <button
                v-if="bloc.main_link_title || bloc.main_link_url"
                class="absolute -left-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                :title="$t('Supprimer')"
                @click="bloc.main_link_title = ''; bloc.main_link_url = ''"
              >
                <RiDeleteBinLine class="size-5" />
              </button>
              <BrandedButton
                :color="mainColor"
                class="pointer-events-none"
              >
                <input
                  v-model="bloc.main_link_title"
                  type="text"
                  class="bg-transparent border-none outline-none text-inherit font-inherit pointer-events-auto"
                  :style="{ width: `${Math.max(10, bloc.main_link_title?.length || 0)}ch` }"
                  :placeholder="$t('Titre du bouton')"
                >
              </BrandedButton>
              <input
                v-model="bloc.main_link_url"
                type="text"
                class="block text-sm text-gray-500 border rounded px-2 py-1 w-full max-w-xs"
                :placeholder="$t('URL du bouton')"
              >
            </div>

            <BrandedButton
              v-if="!edit && !bloc.paragraph && bloc.main_link_title && bloc.main_link_url"
              :href="bloc.main_link_url"
              class="mt-12"
              :color="mainColor"
            >
              {{ bloc.main_link_title }}
            </BrandedButton>
          </div>
        </div>
      </div>

      <!-- Bouton ajouter en bas du dernier bloc -->
      <div
        v-if="edit && index === workingPage.blocs.length - 1"
        class="absolute -bottom-4 left-0 right-0 flex items-center justify-center z-20"
      >
        <AddBlocDropdown @new-bloc="workingPage.blocs.push($event)">
          <BrandedButton
            color="tertiary"
            size="xs"
            class="bg-white shadow-sm"
            :icon="RiAddLine"
          >
            {{ $t('Ajouter un bloc') }}
          </BrandedButton>
        </AddBlocDropdown>
      </div>
    </div>

    <!-- Message si page vide en mode edit -->
    <div
      v-if="edit && workingPage.blocs.length === 0"
      class="py-24"
    >
      <div class="container text-center">
        <p class="text-gray-500 mb-4">
          {{ $t('Page vide') }}
        </p>
        <AddBlocDropdown @new-bloc="workingPage.blocs.push($event)">
          <BrandedButton :icon="RiAddLine">
            {{ $t('Ajouter un bloc') }}
          </BrandedButton>
        </AddBlocDropdown>
      </div>
    </div>

    <!-- Barre de sauvegarde -->
    <div
      v-if="edit"
      class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex justify-end gap-4 z-50"
    >
      <BrandedButton
        color="secondary"
        @click="cancel"
      >
        {{ $t('Annuler') }}
      </BrandedButton>
      <BrandedButton @click="save">
        {{ $t('Sauvegarder') }}
      </BrandedButton>
    </div>

    <!-- Modale de sélection de dataset -->
    <ModalWithButton
      v-model="isDatasetSelectorOpen"
      :title="$t('Sélectionner des jeux de données')"
      size="lg"
    >
      <DatasetsSelect v-model="selectedDatasets" />
      <template #footer>
        <div class="flex-1 flex justify-end">
          <BrandedButton @click="validateDatasetSelection">
            {{ $t('Valider') }}
          </BrandedButton>
        </div>
      </template>
    </ModalWithButton>

    <!-- Modale de sélection de réutilisation -->
    <ModalWithButton
      v-model="isReuseSelectorOpen"
      :title="$t('Sélectionner des réutilisations')"
      size="lg"
    >
      <ReusesSelect v-model="selectedReuses" />
      <template #footer>
        <div class="flex-1 flex justify-end">
          <BrandedButton @click="validateReuseSelection">
            {{ $t('Valider') }}
          </BrandedButton>
        </div>
      </template>
    </ModalWithButton>

    <!-- Modale de sélection d'API -->
    <ModalWithButton
      v-model="isDataserviceSelectorOpen"
      :title="$t('Sélectionner des APIs')"
      size="lg"
    >
      <DataservicesSelect v-model="selectedDataservices" />
      <template #footer>
        <div class="flex-1 flex justify-end">
          <BrandedButton @click="validateDataserviceSelection">
            {{ $t('Valider') }}
          </BrandedButton>
        </div>
      </template>
    </ModalWithButton>
  </div>
</template>

<script setup lang="ts">
import type { ComponentProps } from 'vue-component-type-helpers'
import Sortable, { type MoveEvent, type SortableEvent } from 'sortablejs'
import { BrandedButton, DataserviceCard, ReuseCard } from '@datagouv/components-next'
import { RiAddLine, RiArrowDownLine, RiArrowRightUpLine, RiArrowUpLine, RiDeleteBinLine } from '@remixicon/vue'
import CdataLink from '../CdataLink.vue'
import EditableText from './EditableText.vue'
import AddBlocDropdown from './AddBlocDropdown.vue'
import AddObjectCard from './AddObjectCard.vue'
import type { Dataservice, Dataset, DatasetV2, Reuse } from '@datagouv/components-next'
import type { DataservicesListBloc, DatasetsListBloc, Page, ReusesListBloc } from '~/types/pages'
import type { DatasetSuggest } from '~/types/types'

const props = withDefaults(defineProps<{
  page: Page
  edit?: boolean
  mainColor?: ComponentProps<typeof BrandedButton>['color']
}>(), {
  edit: false,
  mainColor: 'primary',
})

const emit = defineEmits<{
  'update:page': [Page]
  'save': [Page]
  'cancel': []
}>()

// En mode edit, on travaille sur une copie réactive
const localPage = ref<Page | null>(null)

watchEffect(() => {
  if (props.edit && !localPage.value) {
    localPage.value = JSON.parse(JSON.stringify(props.page))
  }
})

const workingPage = computed(() => (props.edit ? localPage.value! : props.page))

// Sortable pour réordonner les cartes
const sortableInstances = new WeakMap<HTMLElement, Sortable>()

function initSortable<T>(el: HTMLElement | null, list: T[], enabled: boolean) {
  if (!el) return

  // Nettoyer l'instance existante si on désactive
  if (!enabled) {
    const existing = sortableInstances.get(el)
    if (existing) {
      existing.destroy()
      sortableInstances.delete(el)
    }
    return
  }

  // Ne pas recréer si déjà initialisé
  if (sortableInstances.has(el)) return

  const sortable = Sortable.create(el, {
    animation: 150,
    ghostClass: 'opacity-50',
    filter: '.add-object-card',
    onMove: (evt: MoveEvent) => {
      // Empêcher de déplacer après la carte fantôme
      if (evt.related?.classList.contains('add-object-card')) {
        return false
      }
      return true
    },
    onEnd: (evt: SortableEvent) => {
      if (evt.oldIndex === undefined || evt.newIndex === undefined) return
      if (evt.oldIndex === evt.newIndex) return

      const item = list.splice(evt.oldIndex, 1)[0]
      list.splice(evt.newIndex, 0, item)
    },
  })
  sortableInstances.set(el, sortable)
}

// Fonctions de manipulation des blocs
function moveBloc(index: number, direction: -1 | 1) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= workingPage.value.blocs.length) return

  const blocs = workingPage.value.blocs
  const temp = blocs[index]
  blocs[index] = blocs[newIndex]
  blocs[newIndex] = temp
}

// Sauvegarde et annulation
function save() {
  if (localPage.value) {
    emit('update:page', localPage.value)
    emit('save', localPage.value)
  }
}

function cancel() {
  localPage.value = null
  emit('cancel')
}

const { $api } = useNuxtApp()

// Helpers pour vérifier si un objet est complet
function isFullDataset(obj: Dataset | DatasetV2 | DatasetSuggest): obj is DatasetV2 {
  return 'harvest' in obj || 'metrics' in obj
}

function isFullReuse(obj: Reuse): boolean {
  return 'datasets' in obj
}

// Sélection de datasets
const isDatasetSelectorOpen = ref(false)
const selectedDatasets = ref<Array<Dataset | DatasetV2 | DatasetSuggest>>([])
let currentDatasetBloc: DatasetsListBloc | null = null

function openDatasetSelector(bloc: DatasetsListBloc) {
  currentDatasetBloc = bloc
  selectedDatasets.value = [...bloc.datasets]
  isDatasetSelectorOpen.value = true
}

async function validateDatasetSelection() {
  if (currentDatasetBloc) {
    const fullDatasets = await Promise.all(
      selectedDatasets.value.map(async (dataset) => {
        if (isFullDataset(dataset)) {
          return dataset
        }
        return await $api<DatasetV2>(`/api/2/datasets/${dataset.id}/`)
      }),
    )
    currentDatasetBloc.datasets = fullDatasets
  }
  isDatasetSelectorOpen.value = false
}

// Sélection de réutilisations
const isReuseSelectorOpen = ref(false)
const selectedReuses = ref<Reuse[]>([])
let currentReuseBloc: ReusesListBloc | null = null

function openReuseSelector(bloc: ReusesListBloc) {
  currentReuseBloc = bloc
  selectedReuses.value = [...bloc.reuses]
  isReuseSelectorOpen.value = true
}

async function validateReuseSelection() {
  if (currentReuseBloc) {
    const fullReuses = await Promise.all(
      selectedReuses.value.map(async (reuse) => {
        if (isFullReuse(reuse)) {
          return reuse
        }
        return await $api<Reuse>(`/api/1/reuses/${reuse.id}/`)
      }),
    )
    currentReuseBloc.reuses = fullReuses
  }
  isReuseSelectorOpen.value = false
}

// Sélection d'APIs
const isDataserviceSelectorOpen = ref(false)
const selectedDataservices = ref<Dataservice[]>([])
let currentDataserviceBloc: DataservicesListBloc | null = null

function openDataserviceSelector(bloc: DataservicesListBloc) {
  currentDataserviceBloc = bloc
  selectedDataservices.value = [...bloc.dataservices]
  isDataserviceSelectorOpen.value = true
}

async function validateDataserviceSelection() {
  if (currentDataserviceBloc) {
    currentDataserviceBloc.dataservices = selectedDataservices.value
  }
  isDataserviceSelectorOpen.value = false
}
</script>
