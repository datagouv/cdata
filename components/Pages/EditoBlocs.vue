<template>
  <div :class="{ relative: editable }">
    <!-- Admin edit button. Hidden when empty: the empty state carries its own CTA. -->
    <div
      v-if="editable && !hideEditButton && isMeAdmin() && !isEditing && workingBlocs.length > 0"
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

    <!-- Empty state. In edit mode it invites adding a first bloc; in view mode it
         is only shown when the host opts in via `emptyCtaLabel` (e.g. an org admin
         on an unconfigured presentation), offering a CTA to enter edit mode. The
         visual comes from the host through the #empty slot, with a generic fallback. -->
    <div
      v-if="workingBlocs.length === 0 && (isEditing || (editable && emptyCtaLabel))"
      class="container py-12 flex flex-col items-center text-center"
    >
      <slot name="empty">
        <img
          src="/illustrations/journal.svg"
          class="h-20"
          alt=""
        >
        <p class="fr-text--bold fr-my-3v">
          {{ $t('Cette page est vide') }}
        </p>
        <p class="text-sm text-gray-medium mb-4 max-w-prose text-pretty">
          {{ $t('Ajoutez un premier bloc pour commencer à composer la page.') }}
        </p>
      </slot>
      <AddBlocDropdown
        v-if="isEditing"
        @new-bloc="workingBlocs.push($event)"
      >
        <BrandedButton :icon="RiAddLine">
          {{ $t('Ajouter un bloc') }}
        </BrandedButton>
      </AddBlocDropdown>
      <BrandedButton
        v-else
        :icon="RiEdit2Line"
        @click="enterEditMode"
      >
        {{ emptyCtaLabel }}
      </BrandedButton>
    </div>

    <!-- Save bar -->
    <div
      v-if="isEditing"
      class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex items-center justify-end gap-8 z-50"
    >
      <!-- Hosts can add controls applied on save (e.g. a publish toggle), grouped on
           the right next to the save actions but spaced apart so the action buttons
           read as one unit. -->
      <slot name="save-extra" />
      <div class="flex items-center gap-4">
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
  // When set, the empty state is also shown in view mode (not just while editing)
  // with this label on a CTA that enters edit mode. Hosts that pass it are
  // responsible for only making the page editable (`editable`) for allowed users.
  emptyCtaLabel?: string
  onSave: (blocs: Array<PageBloc>) => Promise<void>
}>(), {
  edit: false,
  editable: false,
  striped: true,
  hideEditButton: false,
  mainColor: 'primary',
  emptyCtaLabel: undefined,
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
