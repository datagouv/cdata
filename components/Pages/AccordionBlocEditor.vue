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
    <AccordionGroup>
      <div ref="sortableRef">
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

            <div class="space-y-8">
              <template
                v-for="(contentBloc, contentIndex) in item.content"
                :key="contentBloc.id"
              >
                <!-- Add button above each bloc -->
                <div
                  v-if="edit"
                  class="flex items-center justify-center"
                >
                  <AddContentBlocDropdown @new-bloc="item.content.splice(contentIndex, 0, $event)">
                    <button
                      type="button"
                      class="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm"
                    >
                      <RiAddLine class="size-4" />
                      {{ $t('Ajouter un bloc') }}
                    </button>
                  </AddContentBlocDropdown>
                </div>

                <div
                  class="relative"
                  data-testid="accordion-content-bloc"
                >
                  <!-- Content bloc toolbar -->
                  <div
                    v-if="edit"
                    class="absolute -left-14 top-1/2 -translate-y-1/2 flex flex-col gap-1"
                  >
                    <BrandedButton
                      color="tertiary"
                      size="xs"
                      :icon="RiArrowUpLine"
                      :disabled="contentIndex === 0"
                      :title="$t('Monter')"
                      @click="moveContent(item.content, contentIndex, -1)"
                    />
                    <BrandedButton
                      color="tertiary"
                      size="xs"
                      :icon="RiArrowDownLine"
                      :disabled="contentIndex === item.content.length - 1"
                      :title="$t('Descendre')"
                      @click="moveContent(item.content, contentIndex, 1)"
                    />
                    <BrandedButton
                      color="tertiary"
                      size="xs"
                      :icon="RiDeleteBinLine"
                      :title="$t('Supprimer')"
                      @click="item.content.splice(contentIndex, 1)"
                    />
                  </div>

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
              </template>

              <!-- Add button at the end (or when empty) -->
              <div
                v-if="edit"
                class="flex items-center justify-center"
              >
                <AddContentBlocDropdown @new-bloc="item.content.push($event)">
                  <button
                    type="button"
                    class="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm"
                    data-testid="accordion-add-content"
                  >
                    <RiAddLine class="size-4" />
                    {{ $t('Ajouter un bloc') }}
                  </button>
                </AddContentBlocDropdown>
              </div>
            </div>
          </Accordion>
        </div>
      </div>

      <!-- New accordion placeholder in edit mode -->
      <Accordion
        v-if="edit"
        :key="newItemKey"
        :title="$t('Titre de l\'élément')"
      >
        <template #title>
          <EditableText
            :model-value="newItemTitle"
            tag="span"
            class="flex-1 text-gray-400"
            :placeholder="$t('Titre de l\'élément')"
            @update:model-value="createNewItem($event)"
          />
        </template>
        <div class="text-gray-400 text-sm">
          {{ $t('Renseignez un titre pour créer un nouvel élément') }}
        </div>
      </Accordion>
    </AccordionGroup>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { RiAddLine, RiArrowDownLine, RiArrowUpLine, RiDeleteBinLine } from '@remixicon/vue'
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

const newItemTitle = ref('')
const newItemKey = ref(0)

function createNewItem(title: string) {
  if (title.trim()) {
    bloc.value.items.push({ title, content: [] })
    newItemTitle.value = ''
    newItemKey.value++
  }
}

function moveContent(content: Array<unknown>, index: number, direction: -1 | 1) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= content.length) return
  const temp = content[index]
  content[index] = content[newIndex]
  content[newIndex] = temp
}
</script>
