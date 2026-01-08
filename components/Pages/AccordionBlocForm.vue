<template>
  <div class="space-y-4">
    <InputGroup
      v-model="bloc.description"
      :label="$t('Description')"
      type="textarea"
    />

    <div class="border-t pt-4">
      <div class="font-bold text-gray-title mb-4">
        {{ $t('Éléments de l\'accordéon') }}
      </div>

      <div
        ref="sortableRoot"
        class="space-y-2"
      >
        <div
          v-for="(item, index) in bloc.items"
          :key="index"
          class="border rounded p-4"
        >
          <div class="flex items-start gap-2">
            <BrandedButton
              class="handle shrink-0 mt-2"
              color="tertiary"
              :title="$t('Faites glisser pour déplacer cet élément')"
              :icon="RiDraggable"
              size="lg"
              keep-margins-even-without-borders
            />
            <div class="flex-1 space-y-4">
              <InputGroup
                v-model="item.title"
                :label="$t('Titre de l\'élément')"
                :required="true"
              />

              <div class="space-y-2">
                <div class="text-sm text-gray-plain">
                  {{ $t('Contenu') }}
                </div>
                <div
                  v-for="(contentBloc, contentIndex) in item.content"
                  :key="contentIndex"
                  class="flex items-center gap-2 bg-gray-lowest p-2 rounded"
                >
                  <component
                    :is="contentBlocsTypes[contentBloc.class].icon"
                    class="size-4 shrink-0"
                  />
                  <span class="flex-1 truncate text-sm">
                    {{ contentBloc.title || contentBlocsTypes[contentBloc.class].name }}
                  </span>
                  <BrandedButton
                    color="tertiary"
                    :title="$t('Supprimer')"
                    :icon="RiDeleteBinLine"
                    size="xs"
                    @click="item.content.splice(contentIndex, 1)"
                  />
                </div>
                <AddContentBlocDropdown @new-bloc="item.content.push($event)">
                  <BrandedButton
                    color="tertiary"
                    size="xs"
                    :icon="RiAddLine"
                  >
                    {{ $t('Ajouter un contenu') }}
                  </BrandedButton>
                </AddContentBlocDropdown>
              </div>
            </div>
            <BrandedButton
              class="shrink-0"
              color="tertiary"
              :title="$t('Supprimer l\'élément')"
              :icon="RiDeleteBinLine"
              size="lg"
              keep-margins-even-without-borders
              @click="removeItem(index)"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center mt-4">
        <BrandedButton
          color="tertiary"
          size="xs"
          :icon="RiAddLine"
          @click="addItem"
        >
          {{ $t('Ajouter un élément') }}
        </BrandedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable'
import { BrandedButton } from '@datagouv/components-next'
import { RiAddLine, RiDeleteBinLine, RiDraggable } from '@remixicon/vue'
import AddContentBlocDropdown from './AddContentBlocDropdown.vue'
import type { AccordionBloc } from '~/types/pages'

const bloc = defineModel<AccordionBloc>({ required: true })

const contentBlocsTypes = useContentBlocsTypes()

const sortableRootRef = useTemplateRef('sortableRoot')
useSortable(sortableRootRef, bloc.value.items, { handle: '.handle' })

function addItem() {
  bloc.value.items.push({ title: '', content: [] })
}

function removeItem(index: number) {
  bloc.value.items.splice(index, 1)
}
</script>
