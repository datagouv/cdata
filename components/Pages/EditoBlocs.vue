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

    <div ref="sortableRef">
      <template
        v-for="(bloc, index) in workingBlocs"
        :key="bloc.id"
      >
        <!-- An empty section is only a placeholder for the editor -->
        <EditItem
          v-if="isEditing || bloc.class !== 'SectionBloc' || bloc.blocs.length"
          :edit="isEditing"
          :label="labels[bloc.class] ?? bloc.class"
          group="sections"
          class="group/section"
          :class="bloc.class === 'SectionBloc' && (striped ? 'py-24 odd:bg-gray-some even:bg-white' : 'py-12')"
          :data-testid="`page-${bloc.class}`"
          data-sortable-item
          @delete="workingBlocs.splice(index, 1)"
          @keyboard-move="moveWithKeyboard($event, index)"
        >
          <!-- Add button above the bloc (absolute positioned), shown on hover -->
          <div
            v-if="isEditing"
            class="absolute -top-4 left-0 right-0 flex items-center justify-center z-20 opacity-0 group-hover/section:opacity-100 focus-within:opacity-100 transition-opacity"
          >
            <AddBlocDropdown
              level="page"
              :for-organization="forOrganization"
              @new-blocs="workingBlocs.splice(index, 0, ...($event as Array<PageBloc>))"
            >
              <BrandedButton
                color="tertiary"
                size="xs"
                class="bg-white shadow-sm"
                :icon="RiAddLine"
              >
                {{ $t('Ajouter une section') }}
              </BrandedButton>
            </AddBlocDropdown>
          </div>
          <HeroBloc
            v-if="bloc.class === 'HeroBloc'"
            v-model="(workingBlocs[index] as HeroBlocType)"
            :edit="isEditing"
          />
          <div
            v-else
            class="container"
          >
            <BlocsList
              v-model="(workingBlocs[index] as SectionBloc).blocs"
              :edit="isEditing"
              level="section"
            />
          </div>

          <!-- Add button below the last bloc, always shown: the way to grow the page -->
          <div
            v-if="isEditing && index === workingBlocs.length - 1"
            class="absolute -bottom-4 left-0 right-0 flex items-center justify-center z-20"
          >
            <AddBlocDropdown
              level="page"
              :for-organization="forOrganization"
              @new-blocs="workingBlocs.push(...($event as Array<PageBloc>))"
            >
              <BrandedButton
                color="tertiary"
                size="xs"
                class="bg-white shadow-sm"
                :icon="RiAddLine"
              >
                {{ $t('Ajouter une section') }}
              </BrandedButton>
            </AddBlocDropdown>
          </div>
        </EditItem>
      </template>
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
        level="page"
        :for-organization="forOrganization"
        @new-blocs="workingBlocs.push(...($event as Array<PageBloc>))"
      >
        <BrandedButton :icon="RiAddLine">
          {{ $t('Ajouter une section') }}
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
import { BrandedButton } from '@datagouv/components-next'
import { RiAddLine, RiEdit2Line } from '@remixicon/vue'
import AddBlocDropdown from './AddBlocDropdown.vue'
import BlocsList from './BlocsList.vue'
import EditItem from './EditItem.vue'
import HeroBloc from './HeroBloc.vue'
import type { HeroBloc as HeroBlocType, PageBloc, SectionBloc } from '~/types/pages'
import { isMeAdmin } from '~/utils/auth'
import { BLOCS_MAIN_COLOR, normalizeBlocs, type LegacyBloc } from '~/utils/blocs'

const props = withDefaults(defineProps<{
  blocs: Array<PageBloc | LegacyBloc>
  edit?: boolean
  editable?: boolean
  striped?: boolean
  hideEditButton?: boolean
  // Organization presentation pages have no Hero bloc. See AddBlocDropdown.
  forOrganization?: boolean
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
  forOrganization: false,
  mainColor: 'primary',
  emptyCtaLabel: undefined,
})

provide(BLOCS_MAIN_COLOR, props.mainColor)

// From the raw array, so that the working copy below can be `structuredClone`d (a
// reactive proxy cannot be).
const normalizedBlocs = computed(() => normalizeBlocs(toRaw(props.blocs)))

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
    localBlocs.value = structuredClone(normalizedBlocs.value)
  }
})

const workingBlocs = computed(() => localBlocs.value ?? normalizedBlocs.value)

// Check if there are unsaved changes
const hasUnsavedChanges = computed(() => {
  return localBlocs.value !== null && JSON.stringify(toRaw(localBlocs.value)) !== JSON.stringify(normalizedBlocs.value)
})

// Warn before leaving with unsaved changes.
const { t } = useTranslation()

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value) {
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
  if (!hasUnsavedChanges.value) return true
  return window.confirm(t('Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ?'))
})

const labels = useBlocLabels()

const { sortableRef, moveWithKeyboard } = useBlocSortable(
  () => workingBlocs.value,
  isEditing,
  { group: 'sections' },
)

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
  // Nulling (not re-cloning) keeps a later props.blocs refresh from making a stale
  // clone differ and phantom-flag "unsaved changes".
  localBlocs.value = null
  if (props.editable) {
    exitEditMode()
  }
  else {
    emit('cancel')
  }
}
</script>
