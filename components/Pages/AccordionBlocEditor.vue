<template>
  <div class="space-y-6">
    <!-- Description -->
    <div v-if="edit || bloc.description">
      <EditableText
        v-if="edit"
        :model-value="bloc.description ?? ''"
        tag="p"
        class="text-gray-plain"
        @update:model-value="bloc.description = $event || null"
      />
      <p
        v-else-if="bloc.description"
        class="text-gray-plain"
      >
        {{ bloc.description }}
      </p>
    </div>
    <button
      v-if="edit && !bloc.description"
      type="button"
      class="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm"
      @click="bloc.description = $t('Description de l\'accordéon')"
    >
      <RiAddLine class="size-4" />
      {{ $t('Ajouter une description') }}
    </button>

    <!-- Accordion items -->
    <div
      ref="sortableRef"
      class="space-y-2"
    >
      <div
        v-for="(item, itemIndex) in bloc.items"
        :key="itemIndex"
        class="relative"
        :class="{ 'cursor-grab active:cursor-grabbing': edit }"
      >
        <!-- Edit mode: editable accordion item -->
        <div
          v-if="edit"
          class="border rounded-lg overflow-hidden"
        >
          <div class="flex items-center gap-2 bg-gray-lowest p-3">
            <button
              type="button"
              class="text-gray-500 hover:text-gray-700"
              :title="$t('Supprimer')"
              @click="bloc.items.splice(itemIndex, 1)"
            >
              <RiDeleteBinLine class="size-5" />
            </button>
            <EditableText
              :model-value="item.title || $t('Titre de l\'élément')"
              tag="span"
              class="font-bold flex-1 text-gray-title"
              @update:model-value="item.title = $event"
            />
            <button
              type="button"
              class="text-gray-500 hover:text-gray-700"
              :title="expandedItems.has(itemIndex) ? $t('Réduire') : $t('Développer')"
              @click="toggleItem(itemIndex)"
            >
              <RiArrowDownSLine
                class="size-5 transition-transform"
                :class="{ 'rotate-180': expandedItems.has(itemIndex) }"
              />
            </button>
          </div>

          <!-- Expanded content in edit mode -->
          <div
            v-if="expandedItems.has(itemIndex)"
            class="p-4 space-y-4 border-t"
          >
            <div
              v-for="(contentBloc, contentIndex) in item.content"
              :key="contentBloc.id"
              class="relative border rounded p-4"
              data-testid="accordion-content-bloc"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2 text-gray-title text-sm font-medium">
                  <component
                    :is="contentBlocsTypes[contentBloc.class].icon"
                    class="size-4"
                  />
                  {{ contentBlocsTypes[contentBloc.class].name }}
                </div>
                <button
                  type="button"
                  class="text-gray-500 hover:text-gray-700"
                  :title="$t('Supprimer')"
                  @click="item.content.splice(contentIndex, 1)"
                >
                  <RiDeleteBinLine class="size-4" />
                </button>
              </div>

              <!-- Render the appropriate bloc editor -->
              <DatasetsListBloc
                v-if="contentBloc.class === 'DatasetsListBloc'"
                v-model="(item.content[contentIndex] as DatasetsListBlocType)"
                :edit="true"
              />
              <DataservicesListBloc
                v-if="contentBloc.class === 'DataservicesListBloc'"
                v-model="(item.content[contentIndex] as DataservicesListBlocType)"
                :edit="true"
              />
              <ReusesListBloc
                v-if="contentBloc.class === 'ReusesListBloc'"
                v-model="(item.content[contentIndex] as ReusesListBlocType)"
                :edit="true"
              />
              <LinksListBloc
                v-if="contentBloc.class === 'LinksListBloc'"
                v-model="(item.content[contentIndex] as LinksListBlocType)"
                :edit="true"
              />
            </div>

            <!-- Add content bloc button -->
            <AddContentBlocDropdown @new-bloc="item.content.push($event)">
              <button
                type="button"
                class="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm"
                data-testid="accordion-add-content"
              >
                <RiAddLine class="size-4" />
                {{ $t('Ajouter un contenu') }}
              </button>
            </AddContentBlocDropdown>
          </div>
        </div>

        <!-- Display mode: regular accordion -->
        <AccordionGroup v-else>
          <Accordion :title="item.title">
            <div
              v-for="(contentBloc, contentIndex) in item.content"
              :key="contentIndex"
              class="space-y-4"
            >
              <div
                v-if="contentBloc.class === 'DatasetsListBloc'"
                class="grid sm:grid-cols-2 gap-5"
              >
                <DatasetCardLg
                  v-for="dataset in contentBloc.datasets"
                  :key="dataset.id"
                  class="min-w-0"
                  :dataset
                />
              </div>
              <div
                v-if="contentBloc.class === 'DataservicesListBloc'"
                class="grid sm:grid-cols-2 gap-5"
              >
                <DataserviceCard
                  v-for="dataservice in contentBloc.dataservices"
                  :key="dataservice.id"
                  class="min-w-0"
                  :dataservice
                />
              </div>
              <div
                v-if="contentBloc.class === 'ReusesListBloc'"
                class="grid sm:grid-cols-3 gap-5"
              >
                <ReuseCard
                  v-for="reuse in contentBloc.reuses"
                  :key="reuse.id"
                  class="min-w-0"
                  :reuse
                />
              </div>
              <div
                v-if="contentBloc.class === 'LinksListBloc'"
                class="space-y-4"
              >
                <div
                  v-for="link in contentBloc.links"
                  :key="link.title"
                >
                  <CdataLink
                    class="inline-flex items-center font-bold text-blue-france no-underline hover:underline fr-raw-link"
                    :href="link.url"
                  >
                    {{ link.title }}
                    <RiArrowRightUpLine class="size-4 ml-1" />
                  </CdataLink>
                </div>
              </div>
            </div>
          </Accordion>
        </AccordionGroup>
      </div>
    </div>

    <!-- Add item button -->
    <button
      v-if="edit"
      type="button"
      class="text-gray-400 hover:text-gray-600 flex items-center gap-1"
      @click="addItem"
    >
      <RiAddLine class="size-5" />
      {{ $t('Ajouter un élément') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { DataserviceCard, ReuseCard } from '@datagouv/components-next'
import { RiAddLine, RiArrowDownSLine, RiArrowRightUpLine, RiDeleteBinLine } from '@remixicon/vue'
import EditableText from './EditableText.vue'
import AddContentBlocDropdown from './AddContentBlocDropdown.vue'
import DatasetsListBloc from './DatasetsListBloc.vue'
import DataservicesListBloc from './DataservicesListBloc.vue'
import ReusesListBloc from './ReusesListBloc.vue'
import LinksListBloc from './LinksListBloc.vue'
import CdataLink from '../CdataLink.vue'
import type {
  AccordionListBloc,
  DatasetsListBloc as DatasetsListBlocType,
  DataservicesListBloc as DataservicesListBlocType,
  ReusesListBloc as ReusesListBlocType,
  LinksListBloc as LinksListBlocType,
} from '~/types/pages'

const props = defineProps<{
  edit: boolean
}>()

const bloc = defineModel<AccordionListBloc>({ required: true })

const contentBlocsTypes = useContentBlocsTypes()

const { sortableRef } = useBlocSortable(
  computed(() => bloc.value.items),
  toRef(props, 'edit'),
)

const expandedItems = ref(new Set<number>())

function toggleItem(index: number) {
  if (expandedItems.value.has(index)) {
    expandedItems.value.delete(index)
  }
  else {
    expandedItems.value.add(index)
  }
}

function addItem() {
  bloc.value.items.push({ title: '', content: [] })
  expandedItems.value.add(bloc.value.items.length - 1)
}
</script>
