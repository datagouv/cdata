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
        <!-- Delete button in edit mode -->
        <button
          v-if="edit"
          type="button"
          class="absolute -left-8 top-3 text-gray-500 hover:text-gray-700 z-10"
          :title="$t('Supprimer')"
          @click="bloc.items.splice(itemIndex, 1)"
        >
          <RiDeleteBinLine class="size-5" />
        </button>

        <AccordionGroup>
          <Accordion :title="item.title || $t('Titre de l\'élément')">
            <template
              v-if="edit"
              #title
            >
              <EditableText
                :model-value="item.title || $t('Titre de l\'élément')"
                tag="span"
                class="flex-1"
                @update:model-value="item.title = $event"
              />
            </template>

            <div class="space-y-6">
              <div
                v-for="(contentBloc, contentIndex) in item.content"
                :key="contentBloc.id"
                class="relative"
                data-testid="accordion-content-bloc"
              >
                <button
                  v-if="edit"
                  type="button"
                  class="absolute -left-8 top-0 text-gray-500 hover:text-gray-700"
                  :title="$t('Supprimer')"
                  @click="item.content.splice(contentIndex, 1)"
                >
                  <RiDeleteBinLine class="size-4" />
                </button>

                <DatasetsListBloc
                  v-if="contentBloc.class === 'DatasetsListBloc'"
                  v-model="(item.content[contentIndex] as DatasetsListBlocType)"
                  :edit
                />
                <DataservicesListBloc
                  v-if="contentBloc.class === 'DataservicesListBloc'"
                  v-model="(item.content[contentIndex] as DataservicesListBlocType)"
                  :edit
                />
                <ReusesListBloc
                  v-if="contentBloc.class === 'ReusesListBloc'"
                  v-model="(item.content[contentIndex] as ReusesListBlocType)"
                  :edit
                />
                <LinksListBloc
                  v-if="contentBloc.class === 'LinksListBloc'"
                  v-model="(item.content[contentIndex] as LinksListBlocType)"
                  :edit
                />
              </div>

              <!-- Add content bloc button -->
              <AddContentBlocDropdown
                v-if="edit"
                @new-bloc="item.content.push($event)"
              >
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
import { RiAddLine, RiDeleteBinLine } from '@remixicon/vue'
import EditableText from './EditableText.vue'
import AddContentBlocDropdown from './AddContentBlocDropdown.vue'
import DatasetsListBloc from './DatasetsListBloc.vue'
import DataservicesListBloc from './DataservicesListBloc.vue'
import ReusesListBloc from './ReusesListBloc.vue'
import LinksListBloc from './LinksListBloc.vue'
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

const { sortableRef } = useBlocSortable(
  computed(() => bloc.value.items),
  toRef(props, 'edit'),
)

function addItem() {
  bloc.value.items.push({ title: '', content: [] })
}
</script>
