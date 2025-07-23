<template>
  <div class="space-y-5">
    <div class="flex justify-end gap-4">
      <ModalWithButton
        :title="$t('Prévisualiser')"
        size="fullscreen"
      >
        <template #button="{ attrs, listeners }">
          <BrandedButton
            color="secondary"
            :icon="RiEyeLine"
            size="xs"
            v-bind="attrs"
            v-on="listeners"
          >
            {{ $t('Prévisualiser') }}
          </BrandedButton>
        </template>

        <PageShow :page />
      </ModalWithButton>

      <Menu
        as="div"
        class="relative inline-block text-left"
      >
        <MenuButton>
          <BrandedButton
            :icon="RiAddLine"
            size="xs"
          >
            {{ $t('Ajouter un bloc') }}
          </BrandedButton>
        </MenuButton>
        <MenuItems>
          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <MenuItems class="overflow-hidden absolute right-0 z-10 mt-2 w-96 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden">
              <div
                v-for="groupOfBloc in newBlocsTypes"
                :key="groupOfBloc.name"
              >
                <div class="px-4 py-2 uppercase font-bold bg-gray-lowest-2 text-sm border-b border-gray-default">
                  {{ groupOfBloc.name }}
                </div>
                <MenuItem
                  v-for="key in groupOfBloc.blocsTypes"
                  :key="blocsTypes[key].name"
                  v-slot="{ active }"
                >
                  <button
                    class="block px-4 py-2 text-sm w-full text-left space-y-1"
                    :class="[active ? 'bg-gray-100 text-gray-900 outline-hidden' : 'text-gray-700']"
                    type="button"
                    @click="page.blocs.push(blocsTypes[key].default())"
                  >
                    <div class="flex space-x-1 items-center text-gray-title">
                      <component
                        :is="blocsTypes[key].icon"
                        class="size-4"
                      />
                      <div class="text-sm">
                        {{ blocsTypes[key].name }}
                      </div>
                    </div>
                    <div class="text-xs text-gray-plain">
                      {{ blocsTypes[key].description }}
                    </div>
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </MenuItems>
      </Menu>
    </div>

    <form @submit.prevent="$emit('submit')">
      <PaddedContainer>
        <div
          v-if="page.blocs.length"
          ref="sortableRoot"
          class="w-full space-y-4 mb-4"
        >
          <div
            v-for="(bloc, index) in page.blocs"
            :key="index"
            class="flex items-center space-x-2"
          >
            <div class="shrink-0">
              <BrandedButton
                color="primary-softer"
                :title="t('Faites glisser pour déplacer ce contenu')"
                :icon="RiDraggable"
                size="lg"
                keep-margins-even-without-borders
              />
            </div>
            <div class="flex-1 overflow-hidden border p-4">
              <div class="flex space-x-1 items-center text-gray-title">
                <component
                  :is="blocsTypes[bloc.type].icon"
                  class="size-4 -mt-1"
                />
                <div class="font-bold">
                  {{ bloc.title }}
                </div>
              </div>
              <div class="max-w-full text-gray-title truncate">
                <template v-if="bloc.datasets.length">
                  {{ humanJoin(bloc.datasets.map(d => d.title)) }}
                </template>
                <template v-else>
                  {{ $t('Pas de jeux de données sélectionnés') }}
                </template>
              </div>
            </div>
            <div class="shrink-0">
              <ModalWithButton
                :title="bloc.title"
                size="xl"
              >
                <template #button="{ attrs, listeners }">
                  <BrandedButton
                    color="primary-softer"
                    :title="t('Modifier le bloc')"
                    :icon="RiEditLine"
                    size="lg"
                    keep-margins-even-without-borders
                    v-bind="attrs"
                    v-on="listeners"
                  />
                </template>

                <InputGroup
                  v-model="bloc.title"
                  :label="$t('Titre')"
                  :required="true"
                />

                <InputGroup
                  v-model="bloc.subtitle"
                  :label="$t('Sous-titre')"
                />

                <DatasetsSelect v-model="bloc.datasets" />

                <template #footer="{ close }">
                  <div class="flex-1 flex justify-end">
                    <BrandedButton
                      color="primary"
                      @click="close"
                    >
                      {{ $t('Valider') }}
                    </BrandedButton>
                  </div>
                </template>
              </ModalWithButton>
            </div>
            <div class="shrink-0">
              <BrandedButton
                color="primary-softer"
                :title="t('Supprimer le bloc')"
                :icon="RiDeleteBinLine"
                size="lg"
                keep-margins-even-without-borders
                @click="removeBloc(index)"
              />
            </div>
          </div>
        </div>
        <div v-else>
          {{ $t('Page vide, ajoutez un bloc via le bouton ci-dessus.') }}
        </div>

        <div
          v-if="page.blocs.length"
          class="flex justify-end"
        >
          <BrandedButton
            type="submit"
            :loading
          >
            {{ $t('Sauvegarder') }}
          </BrandedButton>
        </div>
      </PaddedContainer>
    </form>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { RiAddLine, RiDatabase2Line, RiDeleteBinLine, RiDraggable, RiEditLine, RiEyeLine } from '@remixicon/vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import PageShow from './PageShow.vue'
import type { Page, PageBloc } from '~/types/pages'

const { t } = useI18n()

defineProps<{
  loading: boolean
}>()
const page = defineModel<Page>({ required: true })
defineEmits<{
  submit: []
}>()

const blocsTypes = {
  datasets_list: {
    icon: RiDatabase2Line,
    name: t('Données à la une'),
    description: t('Mettre en avant jusqu\'à 4 jeux de données'),
    default: (): PageBloc => ({ type: 'datasets_list', title: 'Mes jeux de données', subtitle: '', datasets: [] }),
  },
}

const newBlocsTypes: Array<{ name: string, blocsTypes: Array<keyof typeof blocsTypes> }> = [
  { name: t('Contenus à la une'), blocsTypes: ['datasets_list'] },
]

function removeBloc(index: number) {
  page.value.blocs.splice(index, 1)
};

const sortableRootRef = useTemplateRef('sortableRoot')
useSortable(sortableRootRef, page.value.blocs)
</script>
