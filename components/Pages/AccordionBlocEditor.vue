<template>
  <AccordionGroup>
    <div
      ref="listRef"
      data-drop-list
    >
      <EditItem
        v-for="(item, itemIndex) in bloc.items"
        :key="itemIndex"
        :edit
        :label="labels.AccordionItem"
        draggable
        data-drop-item
        @delete="bloc.items.splice(itemIndex, 1)"
        @drag-start="startBlocsDrag($event, { list: listRef!, index: itemIndex, kind: 'accordion-item', classes: [], label: labels.AccordionItem })"
        @keyboard-move="moveWithKeyboard(bloc.items, $event, itemIndex)"
      >
        <Accordion
          :id="`accordion-${bloc.id}-${itemIndex}`"
          :title="item.title || $t('Titre de l\'élément')"
        >
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

          <BlocsList
            v-model="item.content"
            :edit
            level="accordion"
          />
        </Accordion>
      </EditItem>
    </div>

    <!-- New accordion placeholder in edit mode -->
    <div
      v-if="edit"
      data-testid="accordion-new-item"
    >
      <Accordion
        :id="`accordion-${bloc.id}-new-${newItemKey}`"
        :key="newItemKey"
        :title="$t('Titre de l\'élément')"
      >
        <template #title>
          <EditableText
            :model-value="newItemTitle"
            tag="span"
            class="flex-1"
            data-testid="accordion-new-item-title"
            :placeholder="$t('Titre de l\'élément')"
            @update:model-value="createNewItem($event)"
          />
        </template>
        <div class="text-gray-400 text-sm">
          {{ $t('Renseignez un titre pour créer un nouvel élément') }}
        </div>
      </Accordion>
    </div>
  </AccordionGroup>
</template>

<script setup lang="ts">
import EditableText from './EditableText.vue'
import BlocsList from './BlocsList.vue'
import EditItem from './EditItem.vue'
import type { AccordionListBloc } from '~/types/pages'
import { moveWithKeyboard, startBlocsDrag, useDropList } from '~/composables/useBlocsDrag'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<AccordionListBloc>({ required: true })

const labels = useBlocLabels()

// Items move between accordions, and nowhere else.
const listRef = ref<HTMLElement | null>(null)
useDropList(listRef, {
  orientation: 'vertical',
  items: () => bloc.value.items,
  accepts: dragged => dragged.kind === 'accordion-item',
  receive: item => [item],
})

const newItemTitle = ref('')
const newItemKey = ref(0)

function createNewItem(title: string) {
  if (title.trim()) {
    bloc.value.items.push({ title, content: [] })
    newItemTitle.value = ''
    newItemKey.value++
  }
}
</script>
