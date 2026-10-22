<template>
  <div :class="{ relative: editable }">
    <!-- Admin edit button. Hidden when empty: the empty state carries its own CTA. -->
    <div
      v-if="editable && !hideEditButton && isMeAdmin() && !isEditing && shownBlocs.length > 0"
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
      ref="listRef"
      data-drop-list
    >
      <EditItem
        v-for="{ bloc, index } in shownBlocs"
        :key="bloc.id"
        :edit="isEditing"
        :label="labels[bloc.class] ?? bloc.class"
        draggable
        band
        class="group/section"
        :class="[striped ? 'py-24' : 'py-12', bloc.color ? heroBgColor(bloc.color) : striped && 'odd:bg-gray-some even:bg-white']"
        :data-testid="`page-${bloc.class}`"
        :data-section-color="bloc.color ?? undefined"
        data-drop-item
        @delete="workingBlocs.splice(index, 1)"
        @drag-start="startBlocsDrag($event, { list: listRef!, index, kind: 'band', label: labels[bloc.class] ?? bloc.class })"
        @keyboard-move="moveWithKeyboard(workingBlocs, $event, index)"
      >
        <!-- The background of the section; an organization page sits under the banner of
             the organization, its sections keep neutral ones -->
        <template
          v-if="!forOrganization"
          #actions
        >
          <MenuItem
            v-for="color in SECTION_COLORS"
            :key="color.value ?? 'neutral'"
            v-slot="{ active }"
          >
            <button
              type="button"
              class="flex w-full items-center gap-2 px-3 py-1.5"
              :class="{ 'bg-gray-100': active }"
              @click="bloc.color = color.value"
            >
              <span
                class="size-4 rounded-full border border-gray-300"
                :class="color.value ? heroBgColor(color.value) : 'bg-gray-some'"
              />
              {{ color.label }}
              <RiCheckLine
                v-if="bloc.color === color.value"
                class="size-4 ml-auto"
              />
            </button>
          </MenuItem>
        </template>
        <!-- Add button above the bloc (absolute positioned), shown on hover -->
        <div
          v-if="isEditing"
          class="absolute -top-4 left-0 right-0 flex items-center justify-center z-20 opacity-0 group-hover/section:opacity-100 focus-within:opacity-100 transition-opacity delay-400 group-hover/section:delay-0 focus-within:delay-0"
          data-edit-control
        >
          <AddBlocDropdown
            level="page"
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
        <div class="container">
          <BlocsList
            v-model="workingBlocs[index].blocs"
            :edit="isEditing"
            level="section"
            :color="bloc.color"
          />
        </div>

        <!-- Add button below the last bloc, always shown: the way to grow the page -->
        <div
          v-if="isEditing && index === workingBlocs.length - 1"
          class="absolute -bottom-4 left-0 right-0 flex items-center justify-center z-20"
          data-edit-control
        >
          <AddBlocDropdown
            level="page"
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
    </div>

    <BlocsDragLayer v-if="isEditing" />

    <!-- Empty state. In edit mode it invites adding a first bloc; in view mode it
         is only shown when the host opts in via `emptyCtaLabel` (e.g. an org admin
         on an unconfigured presentation), offering a CTA to enter edit mode. The
         visual comes from the host through the #empty slot, with a generic fallback. -->
    <div
      v-if="shownBlocs.length === 0 && (isEditing || (editable && emptyCtaLabel))"
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
    <!-- The add menus keep clear of it (see `AddBlocDropdown`) -->
    <div
      v-if="isEditing"
      class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex items-center justify-end gap-8 z-50"
      data-blocs-save-bar
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
import { MenuItem } from '@headlessui/vue'
import { RiAddLine, RiCheckLine, RiEdit2Line } from '@remixicon/vue'
import AddBlocDropdown from './AddBlocDropdown.vue'
import BlocsDragLayer from './BlocsDragLayer.vue'
import BlocsList from './BlocsList.vue'
import EditItem from './EditItem.vue'
import type { PageBloc, SectionColor } from '~/types/pages'
import { isMeAdmin } from '~/utils/auth'
import { BLOCS_MAIN_COLOR, PAGE_TITLE_ID, isShown, normalizeBlocs, type LegacyBloc } from '~/utils/blocs'
import { heroBgColor } from '~/utils/hero'
import { moveWithKeyboard, startBlocsDrag, useDropList } from '~/composables/useBlocsDrag'

const props = withDefaults(defineProps<{
  blocs: Array<PageBloc | LegacyBloc>
  edit?: boolean
  editable?: boolean
  striped?: boolean
  hideEditButton?: boolean
  // Organization presentation pages have no colored section (udata's
  // `check_no_colored_sections`).
  forOrganization?: boolean
  // The page shows no title of its own: the first title bloc is the title of the page (`h1`).
  untitled?: boolean
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
  untitled: false,
  mainColor: 'primary',
  emptyCtaLabel: undefined,
})

provide(BLOCS_MAIN_COLOR, props.mainColor)

// From the raw array, so that the working copy below can be `structuredClone`d (a
// reactive proxy cannot be).
const normalizedBlocs = computed(() => normalizeBlocs(toRaw(props.blocs), !props.forOrganization))

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

// Each bloc keeps its index in `workingBlocs`, which the edits address (nothing is filtered
// out while editing). A page whose sections are all empty has nothing to show: it is empty.
const shownBlocs = computed(() => workingBlocs.value
  .map((bloc, index) => ({ bloc, index }))
  .filter(({ bloc }) => isEditing.value || isShown(bloc)))

// The title of the page: the first bloc of the page, when it is a title.
provide(PAGE_TITLE_ID, computed(() => {
  const first = shownBlocs.value[0]?.bloc.blocs[0]
  return props.untitled && first?.class === 'TitleBloc' ? first.id : null
}))

const { t } = useTranslation()

const SECTION_COLORS: Array<{ value: SectionColor | null, label: string }> = [
  { value: null, label: t('Fond neutre') },
  { value: 'primary', label: t('Fond bleu') },
  { value: 'green', label: t('Fond vert') },
  { value: 'purple', label: t('Fond violet') },
]

// Check if there are unsaved changes
const hasUnsavedChanges = computed(() => {
  return localBlocs.value !== null && JSON.stringify(toRaw(localBlocs.value)) !== JSON.stringify(normalizedBlocs.value)
})

// Warn before leaving with unsaved changes.
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

// Sections and heroes only move among themselves.
const listRef = ref<HTMLElement | null>(null)
useDropList(listRef, {
  orientation: 'vertical',
  items: () => workingBlocs.value,
  accepts: dragged => dragged.kind === 'band',
})

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
