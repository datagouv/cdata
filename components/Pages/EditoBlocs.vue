<template>
  <div :class="{ relative: editable }">
    <!-- Admin edit button -->
    <div
      v-if="editable && !hideEditButton && isMeAdmin() && !isEditing"
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
      v-for="(bloc, index) in workingBlocs"
      :key="bloc.id"
      class="relative"
      :class="bloc.class !== 'HeroBloc' && (striped ? 'py-24 odd:bg-gray-some even:bg-white' : 'py-12')"
    >
      <!-- Add button above the bloc (absolute positioned) -->
      <div
        v-if="isEditing"
        class="absolute -top-4 left-0 right-0 flex items-center justify-center"
      >
        <AddBlocDropdown @new-bloc="workingBlocs.splice(index, 0, $event)">
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
          :disabled="index === workingBlocs.length - 1"
          :title="$t('Descendre')"
          @click="moveBloc(index, 1)"
        />
        <BrandedButton
          color="tertiary"
          :icon="RiDeleteBinLine"
          :title="$t('Supprimer')"
          @click="workingBlocs.splice(index, 1)"
        />
      </div>

      <!-- Full-width blocs (like HeroBloc) -->
      <component
        :is="blocsTypes[bloc.class].component"
        v-if="blocsTypes[bloc.class] && 'fullWidth' in blocsTypes[bloc.class] && blocsTypes[bloc.class].component"
        v-model="(workingBlocs[index] as any)"
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
          v-if="blocsTypes[bloc.class]?.component"
          v-model="(workingBlocs[index] as any)"
          :edit="isEditing"
          v-bind="bloc.class === 'LinksListBloc' ? { 'main-color': mainColor } : {}"
        />
      </div>

      <!-- Add button below the last bloc -->
      <div
        v-if="isEditing && index === workingBlocs.length - 1"
        class="absolute -bottom-4 left-0 right-0 flex items-center justify-center"
      >
        <AddBlocDropdown @new-bloc="workingBlocs.push($event)">
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
      v-if="isEditing && workingBlocs.length === 0"
      class="py-24"
    >
      <div class="container text-center">
        <p class="text-gray-500 mb-4">
          {{ $t('Page vide') }}
        </p>
        <AddBlocDropdown @new-bloc="workingBlocs.push($event)">
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
import * as Sentry from '@sentry/nuxt'
import { BrandedButton } from '@datagouv/components-next'
import { RiAddLine, RiArrowDownLine, RiArrowUpLine, RiDeleteBinLine, RiEdit2Line } from '@remixicon/vue'
import AddBlocDropdown from './AddBlocDropdown.vue'
import type { PageBloc } from '~/types/pages'
import { isMeAdmin } from '~/utils/auth'

const blocsTypes = useBlocsTypes()

const props = withDefaults(defineProps<{
  blocs: Array<PageBloc>
  edit?: boolean
  editable?: boolean
  striped?: boolean
  hideEditButton?: boolean
  mainColor?: ComponentProps<typeof BrandedButton>['color']
  onSave: (blocs: Array<PageBloc>) => Promise<void>
}>(), {
  edit: false,
  editable: false,
  striped: true,
  hideEditButton: false,
  mainColor: 'primary',
})

watchEffect(() => {
  for (const bloc of props.blocs) {
    if (!blocsTypes[bloc.class]) {
      Sentry.captureMessage(`Unknown bloc type: "${bloc.class}"`, 'warning')
    }
  }
})

const emit = defineEmits<{
  cancel: []
}>()

const route = useRoute()
const router = useRouter()

const isEditing = computed(() => props.edit || (props.editable && route.query.edit === 'true'))

// In edit mode, we work on a reactive copy
const localBlocs = ref<Array<PageBloc> | null>(null)

watchEffect(() => {
  if (isEditing.value && !localBlocs.value) {
    localBlocs.value = structuredClone(toRaw(props.blocs))
  }
})

const workingBlocs = computed(() => localBlocs.value ?? props.blocs)

// Check if there are unsaved changes
const hasUnsavedChanges = computed(() => {
  if (!isEditing.value || !localBlocs.value) return false
  return JSON.stringify(toRaw(localBlocs.value)) !== JSON.stringify(toRaw(props.blocs))
})

// Warn before leaving with unsaved changes.
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
  if (newIndex < 0 || newIndex >= workingBlocs.value.length) return

  const blocs = workingBlocs.value
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
  if (!localBlocs.value) return

  await props.onSave(localBlocs.value)
  localBlocs.value = null
  if (props.editable) {
    exitEditMode()
  }
}

function cancel() {
  localBlocs.value = structuredClone(toRaw(props.blocs))
  if (props.editable) {
    exitEditMode()
  }
  else {
    emit('cancel')
  }
}
</script>
