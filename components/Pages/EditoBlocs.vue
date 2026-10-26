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

    <!-- Side menu, outside of the edit mode whose toolbar lives in the side margins: the
         colored sections opening the page stay above it as banners, the others go next to it -->
    <template v-if="sidemenu && !isEditing">
      <div
        v-for="(section, index) in leadingColoredSections"
        :key="section.id"
        :class="[sectionPadding(index), heroBgColor(section.color!)]"
        data-testid="page-SectionBloc"
      >
        <div class="container">
          <div
            v-if="index === 0 && $slots.breadcrumb"
            class="hero-breadcrumb mb-16"
          >
            <slot name="breadcrumb" />
          </div>
          <BlocsList
            :model-value="section.blocs"
            :edit="false"
            level="section"
            :color="section.color"
          />
        </div>
      </div>
      <div
        v-if="$slots.breadcrumb && !leadingColoredSections.length"
        class="container pt-4"
      >
        <slot name="breadcrumb" />
      </div>
      <div
        class="container md:flex md:gap-8 pb-12"
        :class="{ 'pt-12': !$slots.breadcrumb || leadingColoredSections.length }"
      >
        <HeadingsSidemenu
          v-if="sidemenuHeadings.length"
          :headings="sidemenuHeadings"
          class="md:w-1/4 shrink-0"
        />
        <div class="flex-1 min-w-0 space-y-12">
          <BlocsList
            v-for="section in workingBlocs.slice(leadingColoredSections.length)"
            :key="section.id"
            :model-value="section.blocs"
            :edit="false"
            level="section"
            :color="section.color"
            :class="section.color && [heroBgColor(section.color), 'rounded-lg p-8']"
            data-testid="page-SectionBloc"
          />
        </div>
      </div>
    </template>

    <!-- No section to hold the breadcrumb -->
    <div
      v-if="!workingBlocs.length && $slots.breadcrumb && !(sidemenu && !isEditing)"
      class="container pt-4"
    >
      <slot name="breadcrumb" />
    </div>
    <div
      v-if="!(sidemenu && !isEditing)"
      ref="listRef"
      data-drop-list
    >
      <EditItem
        v-for="(bloc, index) in workingBlocs"
        :key="bloc.id"
        :edit="isEditing"
        :label="labels[bloc.class] ?? bloc.class"
        draggable
        band
        class="group/section"
        :class="[sectionPadding(index), bloc.color ? heroBgColor(bloc.color) : striped && neutralBackground(index)]"
        :data-testid="`page-${bloc.class}`"
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
        <!-- Adds a section above this one. Only on hover: one per section would crowd the page,
             the one below the last section stays -->
        <div
          v-if="isEditing"
          class="absolute -top-4 left-0 right-0 flex items-center justify-center z-20 opacity-0 group-hover/section:opacity-100 focus-within:opacity-100 transition-opacity delay-400 group-hover/section:delay-0 focus-within:delay-0"
          data-edit-control
        >
          <BrandedButton
            color="tertiary"
            size="xs"
            class="bg-white shadow-sm"
            :icon="RiAddLine"
            @click="workingBlocs.splice(index, 0, newSection())"
          >
            {{ $t('Ajouter une section') }}
          </BrandedButton>
        </div>
        <div class="container">
          <div
            v-if="index === 0 && $slots.breadcrumb"
            :class="bloc.color ? 'hero-breadcrumb mb-16' : 'mb-6'"
          >
            <slot name="breadcrumb" />
          </div>
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
          <BrandedButton
            color="tertiary"
            size="xs"
            class="bg-white shadow-sm"
            :icon="RiAddLine"
            @click="workingBlocs.push(newSection())"
          >
            {{ $t('Ajouter une section') }}
          </BrandedButton>
        </div>
      </EditItem>
    </div>

    <BlocsDragLayer v-if="isEditing" />

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
      <BrandedButton
        v-if="isEditing"
        :icon="RiAddLine"
        @click="workingBlocs.push(newSection())"
      >
        {{ $t('Ajouter une section') }}
      </BrandedButton>
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
import { BrandedButton, formatMarkdown } from '@datagouv/components-next'
import { MenuItem } from '@headlessui/vue'
import { RiAddLine, RiCheckLine, RiEdit2Line } from '@remixicon/vue'
import { v4 as uuidv4 } from 'uuid'
import BlocsDragLayer from './BlocsDragLayer.vue'
import BlocsList from './BlocsList.vue'
import EditItem from './EditItem.vue'
import HeadingsSidemenu from '~/components/Sidemenu/HeadingsSidemenu.vue'
import type { PageBloc, SectionBloc, SectionColor } from '~/types/pages'
import { anchorHeadings, slugify, type Heading } from '~/utils/headings'
import { isMeAdmin } from '~/utils/auth'
import { BLOCS_MAIN_COLOR, FOLLOW_LINKS, PAGE_TITLE_ID, normalizeBlocs, withoutEmptyBlocs, type BlocsMainColor, type LegacyBloc } from '~/utils/blocs'
import { heroBgColor } from '~/utils/hero'
import { moveWithKeyboard, startBlocsDrag, useDropList } from '~/composables/useBlocsDrag'

const props = withDefaults(defineProps<{
  blocs: Array<PageBloc | LegacyBloc>
  edit?: boolean
  editable?: boolean
  striped?: boolean
  sidemenu?: boolean
  hideEditButton?: boolean
  // Organization presentation pages have no colored section (udata's
  // `check_no_colored_sections`).
  forOrganization?: boolean
  // The page shows no title of its own: the first title bloc is the title of the page (`h1`).
  untitled?: boolean
  // Only for blocs written by the team, see `FOLLOW_LINKS`.
  followLinks?: boolean
  mainColor?: BlocsMainColor
  // When set, the empty state is also shown in view mode (not just while editing)
  // with this label on a CTA that enters edit mode. Hosts that pass it are
  // responsible for only making the page editable (`editable`) for allowed users.
  emptyCtaLabel?: string
  onSave: (blocs: Array<PageBloc>) => Promise<void>
}>(), {
  edit: false,
  editable: false,
  striped: true,
  sidemenu: false,
  hideEditButton: false,
  forOrganization: false,
  untitled: false,
  followLinks: false,
  mainColor: 'primary',
  emptyCtaLabel: undefined,
})

provide(BLOCS_MAIN_COLOR, props.mainColor)
provide(FOLLOW_LINKS, props.followLinks)

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

// The title of the page: the first bloc of the page, when it is a title.
const pageTitleId = computed(() => {
  const first = workingBlocs.value[0]?.blocs[0]
  return props.untitled && first?.class === 'TitleBloc' ? first.id : null
})
provide(PAGE_TITLE_ID, pageTitleId)

const { t } = useTranslation()

const SECTION_COLORS: Array<{ value: SectionColor | null, label: string }> = [
  { value: null, label: t('Fond neutre') },
  { value: 'primary', label: t('Fond bleu') },
  { value: 'green', label: t('Fond vert') },
  { value: 'purple', label: t('Fond violet') },
]

const slots = useSlots()

// The first section holds the breadcrumb at its top, as the banner of an organization does: it
// gives up its top padding for it.
function sectionPadding(index: number): string {
  const bottom = props.striped ? 'pb-24' : 'pb-12'
  if (index === 0 && slots.breadcrumb) return `pt-4 ${bottom}`
  return props.striped ? 'py-24' : 'py-12'
}

// The neutral sections alternate their backgrounds. A page opening on one, right under the site
// header, starts on white: a gray band there would set the top of the page apart for nothing.
const neutralOffset = computed(() => props.untitled && workingBlocs.value[0] && !workingBlocs.value[0].color ? 1 : 0)
function neutralBackground(index: number): string {
  return (index + neutralOffset.value) % 2 === 0 ? 'bg-gray-some' : 'bg-white'
}

const leadingColoredSections = computed(() => {
  const index = workingBlocs.value.findIndex(section => !section.color)
  return workingBlocs.value.slice(0, index === -1 ? workingBlocs.value.length : index)
})
// The titles of the sections next to the menu, then the headings of their Markdown, rendered
// with the same options as MarkdownBloc so that their ids are the ones on the page. The title
// of the page is not one of its parts, and the content of the accordions is folded.
const sidemenuHeadings = computed<Array<Heading>>(() => workingBlocs.value
  .slice(leadingColoredSections.value.length)
  .flatMap(section => section.blocs)
  .flatMap((bloc) => {
    if (bloc.class === 'TitleBloc') return bloc.id === pageTitleId.value ? [] : [{ id: slugify(bloc.title), label: bloc.title, level: 2 }]
    if (bloc.class === 'MarkdownBloc') return anchorHeadings(formatMarkdown(bloc.content, { minDepth: 2, noHeadings: false })).headings
    return []
  }),
)

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

// A page only holds sections: they are added directly, without a menu to pick from.
function newSection(): SectionBloc {
  return { class: 'SectionBloc', id: uuidv4(), color: null, blocs: [] }
}

// Sections only move among themselves.
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

  try {
    await props.onSave(withoutEmptyBlocs(localBlocs.value))
  }
  catch {
    // The host reported the error: the changes stay, to be fixed and saved again.
    return
  }
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
