<template>
  <!-- A single choice (sections, on an organization page): no menu to pick it from -->
  <span
    v-if="onlyChoice"
    class="contents"
    @click="pick(onlyChoice)"
  >
    <slot />
  </span>
  <Menu
    v-else
    as="div"
    class="relative inline-block text-left"
  >
    <MenuButton as="template">
      <slot />
    </MenuButton>
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems class="overflow-hidden absolute left-1/2 -translate-x-1/2 z-50 mt-2 w-80 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden">
        <div
          v-for="group in groups"
          :key="group.name"
        >
          <div class="px-4 py-2 uppercase font-bold bg-gray-lowest-2 text-sm border-b border-gray-default">
            {{ group.name }}
          </div>
          <MenuItem
            v-for="choice in group.choices"
            :key="choice.key"
            v-slot="{ active }"
          >
            <button
              class="block px-4 py-2 text-sm w-full text-left space-y-1"
              :class="[active ? 'bg-gray-100 text-gray-900 outline-hidden' : 'text-gray-700']"
              type="button"
              :data-testid="`add-bloc-${choice.key}`"
              @click="pick(choice)"
            >
              <div class="flex space-x-1 items-center text-gray-title">
                <component
                  :is="choice.icon"
                  class="size-4"
                />
                <div class="text-sm">
                  {{ choice.name }}
                </div>
              </div>
              <div class="text-xs text-gray-plain">
                {{ choice.description }}
              </div>
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>

  <ObjectsSelectorModal
    v-if="objectType"
    v-model="isSelectorOpen"
    :type="objectType"
    @select="addObjects"
  />
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { v4 as uuidv4 } from 'uuid'
import ObjectsSelectorModal from './ObjectsSelectorModal.vue'
import type { GridBloc, ObjectBloc, PageBloc, SectionContentBloc } from '~/types/pages'
import { ACCEPTED_BLOCS, OBJECT_CELL_WIDTH, type BlocChoice, type BlocsLevel, type ObjectType } from '~/utils/pages'

const props = defineProps<{
  level: BlocsLevel
  // Organization presentation pages have no Hero bloc.
  forOrganization?: boolean
}>()

const emit = defineEmits<{
  newBlocs: [Array<PageBloc | SectionContentBloc>]
}>()

const { t } = useTranslation()
const choices = useBlocChoices()

const OBJECT_BLOC_CLASS: Record<ObjectType, ObjectBloc['class']> = {
  dataset: 'DatasetBloc',
  dataservice: 'DataserviceBloc',
  reuse: 'ReuseBloc',
}

// The choices whose blocs the level accepts (see `ACCEPTED_BLOCS`).
const groups = computed(() => {
  const accepted = ACCEPTED_BLOCS[props.level].filter(name => !(props.forOrganization && name === 'HeroBloc'))
  const isAccepted = (choice: BlocChoice) => accepted.includes('create' in choice ? choice.key : OBJECT_BLOC_CLASS[choice.objectType])
  return [
    { name: t('Mise en page'), choices: [choices.SectionBloc, choices.HeroBloc, choices.GridBloc, choices.AccordionListBloc] },
    { name: t('Contenus'), choices: [choices.TitleBloc, choices.MarkdownBloc, choices.LinksListBloc] },
    { name: t('Contenus à la une'), choices: [choices.datasets, choices.dataservices, choices.reuses] },
  ]
    .map(group => ({ ...group, choices: group.choices.filter(isAccepted) }))
    .filter(group => group.choices.length)
})

const onlyChoice = computed(() => {
  const [group, ...otherGroups] = groups.value
  return !otherGroups.length && group?.choices.length === 1 ? group.choices[0] : null
})

const objectType = ref<ObjectType | null>(null)
const isSelectorOpen = ref(false)

function pick(choice: BlocChoice) {
  if ('create' in choice) {
    emit('newBlocs', [choice.create()])
    return
  }
  objectType.value = choice.objectType
  isSelectorOpen.value = true
}

function addObjects(blocs: Array<ObjectBloc>) {
  if (!blocs.length) return
  // A cell stacks its objects; elsewhere they are laid out in a grid, one cell each.
  if (props.level === 'cell') {
    emit('newBlocs', blocs)
    return
  }
  const grid: GridBloc = {
    class: 'GridBloc',
    id: uuidv4(),
    cells: blocs.map(bloc => ({ id: uuidv4(), width: OBJECT_CELL_WIDTH[bloc.class], blocs: [bloc] })),
  }
  emit('newBlocs', [grid])
}
</script>
