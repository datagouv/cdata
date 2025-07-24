<template>
  <div>
    <InputGroup
      v-model="bloc.paragraph"
      :label="$t('Text libre')"
      type="textarea"
    />

    <div
      ref="sortableRoot"
      class="divide-y"
    >
      <div
        v-for="(link, index) in bloc.links"
        :key="link.url"
        class="flex items-center gap-2"
      >
        <BrandedButton
          class="handle shrink-0"
          color="primary-softer"
          :title="$t('Faites glisser pour déplacer ce contenu')"
          :icon="RiDraggable"
          size="lg"
          keep-margins-even-without-borders
        />
        <LinkForm
          class="w-full py-6"
          :model-value="link"
          @update:model-value="bloc.links[index] = $event"
        />
        <BrandedButton
          class="shrink-0"
          color="primary-softer"
          :title="$t('Supprimer le lien')"
          :icon="RiDeleteBinLine"
          size="lg"
          keep-margins-even-without-borders
          @click="remove(index)"
        />
      </div>
    </div>
    <div class="flex items-center justify-center">
      <BrandedButton
        color="secondary-softer"
        size="xs"
        @click="bloc.links.push({ title: '', url: '', color: '' })"
      >
        {{ $t('Ajouter un lien') }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable'
import { BrandedButton } from '@datagouv/components-next'
import { RiDeleteBinLine, RiDraggable } from '@remixicon/vue'
import LinkForm from './LinkForm.vue'
import type { LinksListBloc } from '~/types/pages'

const bloc = defineModel<LinksListBloc>({ required: true })

const sortableRootRef = useTemplateRef('sortableRoot')
useSortable(sortableRootRef, bloc.value.links, { handle: '.handle' })

function remove(index: number) {
  bloc.value.links.splice(index, 1)
};
</script>
