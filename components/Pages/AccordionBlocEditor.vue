<template>
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
      </div>
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
import { RiDeleteBinLine } from '@remixicon/vue'
import EditableText from './EditableText.vue'
import BlocsList from './BlocsList.vue'
import type { AccordionListBloc } from '~/types/pages'

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
</script>
