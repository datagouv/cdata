<template>
  <div class="space-y-5">
    <div class="flex justify-end gap-4">
      <BrandedButton
        v-if="publicPage"
        :href="publicPage"
        color="secondary"
        size="xs"
        :icon="RiEyeLine"
      >
        {{ t("Voir la page publique") }}
      </BrandedButton>
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
          <AddBlocDropdown @new-bloc="page.blocs.push($event)">
            <BrandedButton
              :icon="RiAddLine"
              size="xs"
            >
              {{ $t('Ajouter un bloc') }}
            </BrandedButton>
          </AddBlocDropdown>
        </template>

        <PageShow :page />
      </ModalWithButton>
    </div>

    <form @submit.prevent="$emit('submit')">
      <PaddedContainer>
        <div
          v-if="page.blocs.length"
          class="flex items-center justify-center group"
        >
          <AddBlocDropdown @new-bloc="page.blocs.splice(0, 0, $event)">
            <BrandedButton
              color="secondary-softer"
              size="xs"
              class="opacity-25 group-hover:opacity-100"
              :icon="RiAddLine"
            >
              {{ $t('Ajouter un bloc') }}
            </BrandedButton>
          </AddBlocDropdown>
        </div>
        <div
          v-if="page.blocs.length"
          ref="sortableRoot"
          class="w-full space-y-1 mb-4"
        >
          <div
            v-for="(bloc, index) in page.blocs"
            :key="bloc.id"
          >
            <div class="flex items-center space-x-2">
              <div class="shrink-0">
                <BrandedButton
                  color="primary-softer"
                  :title="t('Faites glisser pour déplacer ce contenu')"
                  :icon="RiDraggable"
                  size="lg"
                  class="handle"
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
                <div
                  v-if="bloc.type === 'DatasetsListBloc'"
                  class="max-w-full text-gray-title truncate"
                >
                  <template v-if="bloc.datasets.length">
                    {{ humanJoin(bloc.datasets.map(d => d.title)) }}
                  </template>
                  <template v-else>
                    {{ $t('Pas de jeux de données sélectionnés') }}
                  </template>
                </div>
                <div
                  v-if="bloc.type === 'ReusesListBloc'"
                  class="max-w-full text-gray-title truncate"
                >
                  <template v-if="bloc.reuses.length">
                    {{ humanJoin(bloc.reuses.map(d => d.title)) }}
                  </template>
                  <template v-else>
                    {{ $t('Pas de réutilisations sélectionnées') }}
                  </template>
                </div>
                <div
                  v-if="bloc.type === 'DataservicesListBloc'"
                  class="max-w-full text-gray-title truncate"
                >
                  <template v-if="bloc.dataservices.length">
                    {{ humanJoin(bloc.dataservices.map(d => d.title)) }}
                  </template>
                  <template v-else>
                    {{ $t(`Pas d'APIs sélectionnées`) }}
                  </template>
                </div>
                <div
                  v-if="bloc.type === 'LinksListBloc'"
                  class="max-w-full text-gray-title truncate"
                >
                  <template v-if="bloc.links.length">
                    {{ humanJoin(bloc.links.map(d => d.title)) }}
                  </template>
                  <template v-else>
                    {{ $t('Pas encore de liens') }}
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

                  <DatasetsSelect
                    v-if="bloc.type === 'DatasetsListBloc'"
                    v-model="bloc.datasets"
                  />
                  <ReusesSelect
                    v-if="bloc.type === 'ReusesListBloc'"
                    v-model="bloc.reuses"
                  />
                  <DataservicesSelect
                    v-if="bloc.type === 'DataservicesListBloc'"
                    v-model="bloc.dataservices"
                  />
                  <LinksListForm
                    v-if="bloc.type === 'LinksListBloc'"
                    class="border-t"
                    :model-value="bloc"
                    @update:model-value="page.blocs[index] = $event"
                  />

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
            <div class="flex items-center justify-center group">
              <AddBlocDropdown @new-bloc="page.blocs.splice(index + 1, 0, $event)">
                <BrandedButton
                  color="secondary-softer"
                  size="xs"
                  class="opacity-25 group-hover:opacity-100"
                  :icon="RiAddLine"
                >
                  {{ $t('Ajouter un bloc') }}
                </BrandedButton>
              </AddBlocDropdown>
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
import { RiAddLine, RiDeleteBinLine, RiDraggable, RiEditLine, RiEyeLine } from '@remixicon/vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import ReusesSelect from '../ReusesSelect.vue'
import PageShow from './PageShow.vue'
import AddBlocDropdown from './AddBlocDropdown.vue'
import LinksListForm from './LinksListForm.vue'
import type { Page } from '~/types/pages'

const { t } = useI18n()

defineProps<{
  loading: boolean
  publicPage?: string
}>()
const page = defineModel<Page>({ required: true })
defineEmits<{
  submit: []
}>()

const blocsTypes = useBlocsTypes()

function removeBloc(index: number) {
  page.value.blocs.splice(index, 1)
};

const sortableRootRef = useTemplateRef('sortableRoot')
useSortable(sortableRootRef, page.value.blocs, { handle: '.handle', onUpdate: (e: { oldIndex: number, newIndex: number }) => {
  if (e.oldIndex < 0 || e.oldIndex >= page.value.blocs.length || e.newIndex < 0 || e.newIndex >= page.value.blocs.length) {
    console.error('Out of bounds')
    return
  }

  const item = page.value.blocs.splice(e.oldIndex, 1)[0]
  page.value.blocs.splice(e.newIndex, 0, item)
} })
</script>
