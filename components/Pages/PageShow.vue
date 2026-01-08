<template>
  <div>
    <div
      v-for="(bloc, index) in workingPage.blocs"
      :key="bloc.id"
      class="py-24 odd:bg-gray-some even:bg-white relative"
    >
      <!-- Add button above the bloc (absolute positioned) -->
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
      <!-- Bloc toolbar in edit mode -->
      <div
        v-if="edit"
        class="absolute left-4 top-4 flex flex-row gap-2 z-10 min-[1530px]:left-8 min-[1530px]:top-1/2 min-[1530px]:-translate-y-1/2 min-[1530px]:flex-col"
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
          <!-- Editable title -->
          <EditableText
            v-if="edit"
            v-model="bloc.title"
            class="text-gray-title text-3xl font-extrabold"
          />
          <div
            v-else-if="bloc.title"
            class="text-gray-title text-3xl font-extrabold"
          >
            {{ bloc.title }}
          </div>

          <!-- Editable subtitle -->
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
            @click="bloc.subtitle = $t('Sous-titre')"
          >
            + {{ $t('Ajouter un sous-titre') }}
          </button>
        </div>

        <DatasetsListBloc
          v-if="bloc.class === 'DatasetsListBloc'"
          v-model="(workingPage.blocs[index] as DatasetsListBlocType)"
          :edit
        />

        <DataservicesListBloc
          v-if="bloc.class === 'DataservicesListBloc'"
          v-model="(workingPage.blocs[index] as DataservicesListBlocType)"
          :edit
        />

        <ReusesListBloc
          v-if="bloc.class === 'ReusesListBloc'"
          v-model="(workingPage.blocs[index] as ReusesListBlocType)"
          :edit
        />

        <LinksListBloc
          v-if="bloc.class === 'LinksListBloc'"
          v-model="(workingPage.blocs[index] as LinksListBlocType)"
          :edit
          :main-color="mainColor"
        />

        <AccordionBlocEditor
          v-if="bloc.class === 'AccordionBloc'"
          v-model="(workingPage.blocs[index] as AccordionBlocType)"
          :edit
        />
      </div>

      <!-- Add button below the last bloc -->
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

    <!-- Empty page message in edit mode -->
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

    <!-- Save bar -->
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
  </div>
</template>

<script setup lang="ts">
import type { ComponentProps } from 'vue-component-type-helpers'
import { BrandedButton } from '@datagouv/components-next'
import { RiAddLine, RiArrowDownLine, RiArrowUpLine, RiDeleteBinLine } from '@remixicon/vue'
import EditableText from './EditableText.vue'
import AddBlocDropdown from './AddBlocDropdown.vue'
import DatasetsListBloc from './DatasetsListBloc.vue'
import DataservicesListBloc from './DataservicesListBloc.vue'
import ReusesListBloc from './ReusesListBloc.vue'
import LinksListBloc from './LinksListBloc.vue'
import AccordionBlocEditor from './AccordionBlocEditor.vue'
import type {
  Page,
  DatasetsListBloc as DatasetsListBlocType,
  DataservicesListBloc as DataservicesListBlocType,
  ReusesListBloc as ReusesListBlocType,
  LinksListBloc as LinksListBlocType,
  AccordionBloc as AccordionBlocType,
} from '~/types/pages'

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

// In edit mode, we work on a reactive copy
const localPage = ref<Page | null>(null)

watchEffect(() => {
  if (props.edit && !localPage.value) {
    localPage.value = structuredClone(toRaw(props.page))
  }
})

const workingPage = computed(() => (props.edit ? localPage.value! : props.page))

// Bloc manipulation functions
function moveBloc(index: number, direction: -1 | 1) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= workingPage.value.blocs.length) return

  const blocs = workingPage.value.blocs
  const temp = blocs[index]
  blocs[index] = blocs[newIndex]
  blocs[newIndex] = temp
}

// Save and cancel
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
</script>
