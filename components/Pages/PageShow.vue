<template>
  <div :class="{ relative: editable }">
    <!-- Admin edit button -->
    <div
      v-if="editable && isMeAdmin() && !isEditing"
      class="absolute top-4 right-4 z-50"
    >
      <BrandedButton
        color="warning"
        :icon="RiEdit2Line"
        size="xs"
        @click="enterEditMode"
      >
        {{ $t('Modifier') }}
      </BrandedButton>
    </div>

    <div
      v-for="(bloc, index) in workingPage.blocs"
      :key="bloc.id"
      class="relative"
      :class="bloc.class !== 'HeroBloc' && 'py-24 odd:bg-gray-some even:bg-white'"
    >
      <!-- Add button above the bloc (absolute positioned) -->
      <div
        v-if="isEditing"
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
        v-if="isEditing"
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
        :edit="isEditing"
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
          :edit="isEditing"
          v-bind="bloc.class === 'LinksListBloc' ? { 'main-color': mainColor } : {}"
        />
      </div>

      <!-- Add button below the last bloc -->
      <div
        v-if="isEditing && index === workingPage.blocs.length - 1"
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
      v-if="isEditing && workingPage.blocs.length === 0"
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
      v-if="isEditing"
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
import { RiAddLine, RiArrowDownLine, RiArrowUpLine, RiDeleteBinLine, RiEdit2Line } from '@remixicon/vue'
import { toast } from 'vue-sonner'
import AddBlocDropdown from './AddBlocDropdown.vue'
import type { Page } from '~/types/pages'
import { isMeAdmin } from '~/utils/auth'

const blocsTypes = useBlocsTypes()

const props = withDefaults(defineProps<{
  page: Page
  edit?: boolean
  editable?: boolean
  mainColor?: ComponentProps<typeof BrandedButton>['color']
}>(), {
  edit: false,
  editable: false,
  mainColor: 'primary',
})

const emit = defineEmits<{
  'update:page': [Page]
  'save': [Page]
  'cancel': []
}>()

const { $api } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const isEditing = computed(() => props.edit || (props.editable && route.query.edit === 'true'))

// When editable, keep an internal copy that gets updated after save
const internalPage = ref<Page>(props.page)
watch(() => props.page, (newPage) => {
  internalPage.value = newPage
})
const displayPage = computed(() => props.editable ? internalPage.value : props.page)

// In edit mode, we work on a reactive copy
const localPage = ref<Page | null>(null)

watchEffect(() => {
  if (isEditing.value && !localPage.value) {
    localPage.value = structuredClone(toRaw(displayPage.value))
  }
})

const workingPage = computed(() => (isEditing.value && localPage.value ? localPage.value : displayPage.value))

// Check if there are unsaved changes
const hasUnsavedChanges = computed(() => {
  if (!isEditing.value || !localPage.value) return false
  return JSON.stringify(toRaw(localPage.value)) !== JSON.stringify(toRaw(displayPage.value))
})

// Warn before leaving with unsaved changes.
// There are two different mechanisms because:
// - beforeunload: handles tab close, refresh, external navigation. Modern browsers ignore
//   custom messages for security reasons and show their own generic dialog.
// - onBeforeRouteLeave: handles internal Nuxt/Vue Router navigation. We can use
//   window.confirm() with a custom message here.
const { t } = useTranslation()

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (isEditing.value && hasUnsavedChanges.value) {
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
  if (!isEditing.value || !hasUnsavedChanges.value) return true
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

// Edit mode management
function enterEditMode() {
  router.push({ query: { ...route.query, edit: 'true' } })
}

function exitEditMode() {
  router.replace({ query: { ...route.query, edit: undefined } })
}

// Save and cancel
async function save() {
  if (!localPage.value) return

  if (props.editable) {
    try {
      const response = await $api<Page>(`/api/1/pages/${displayPage.value.id}/`, {
        method: 'PUT',
        body: localPage.value,
      })
      internalPage.value = response
      localPage.value = null
      toast.success(t('Page sauvegardée'))
      exitEditMode()
    }
    catch {
      toast.error(t('Erreur lors de la sauvegarde'))
    }
  }
  else {
    emit('update:page', localPage.value)
    emit('save', localPage.value)
  }
}

function cancel() {
  localPage.value = null
  if (props.editable) {
    exitEditMode()
  }
  else {
    emit('cancel')
  }
}
</script>
