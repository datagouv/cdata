<template>
  <div>
    <div
      v-for="(bloc, index) in workingPage.blocs"
      :key="bloc.id"
      class="relative"
      :class="bloc.class !== 'HeroBloc' && 'py-24 odd:bg-gray-some even:bg-white'"
    >
      <!-- Add button above the bloc (absolute positioned) -->
      <div
        v-if="edit"
        class="absolute -top-4 left-0 right-0 flex items-center justify-center"
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

      <!-- Full-width blocs (like HeroBloc) -->
      <component
        :is="blocsTypes[bloc.class].component"
        v-if="'fullWidth' in blocsTypes[bloc.class]"
        v-model="(workingPage.blocs[index] as any)"
        :edit
        v-bind="bloc.class === 'LinksListBloc' ? { 'main-color': mainColor } : {}"
      />

      <!-- Other blocs use container layout -->
      <div
        v-else
        class="container"
      >
        <component
          :is="blocsTypes[bloc.class].component"
          v-model="(workingPage.blocs[index] as any)"
          :edit
          v-bind="bloc.class === 'LinksListBloc' ? { 'main-color': mainColor } : {}"
        />
      </div>

      <!-- Add button below the last bloc -->
      <div
        v-if="edit && index === workingPage.blocs.length - 1"
        class="absolute -bottom-4 left-0 right-0 flex items-center justify-center"
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
import AddBlocDropdown from './AddBlocDropdown.vue'
import type { Page } from '~/types/pages'

const blocsTypes = useBlocsTypes()

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

// Check if there are unsaved changes
const hasUnsavedChanges = computed(() => {
  if (!props.edit || !localPage.value) return false
  return JSON.stringify(toRaw(localPage.value)) !== JSON.stringify(toRaw(props.page))
})

// Warn before leaving with unsaved changes.
// There are two different mechanisms because:
// - beforeunload: handles tab close, refresh, external navigation. Modern browsers ignore
//   custom messages for security reasons and show their own generic dialog.
// - onBeforeRouteLeave: handles internal Nuxt/Vue Router navigation. We can use
//   window.confirm() with a custom message here.
const { t } = useTranslation()

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (props.edit && hasUnsavedChanges.value) {
    e.preventDefault()
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave(() => {
  if (!props.edit || !hasUnsavedChanges.value) return true
  return window.confirm(t('Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ?'))
})

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
