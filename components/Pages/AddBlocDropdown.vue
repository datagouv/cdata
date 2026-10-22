<template>
  <Menu
    ref="menu"
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
      <!-- Below its button, or above when there is more room there; scrolling when it is
           taller than the room it has. Above the header of the site too (`z-index: 750`),
           which it can reach once above its button. -->
      <MenuItems
        ref="items"
        class="overflow-y-auto z-[800] w-80 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden"
        :style="floatingStyles"
      >
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
    v-if="objectClass"
    v-model="isSelectorOpen"
    :type="objectClass"
    @select="emit('newBlocs', $event)"
  />
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { autoUpdate, flip, offset, shift, size, useFloating } from '@floating-ui/vue'
import ObjectsSelectorModal from './ObjectsSelectorModal.vue'
import type { ObjectBloc, SectionContentBloc } from '~/types/pages'
import type { BlocChoice } from '~/utils/pages'
import { ACCEPTED_BLOCS, type BlocsLevel } from '~/utils/blocsLayout'

const props = defineProps<{
  level: BlocsLevel
}>()

const emit = defineEmits<{
  newBlocs: [Array<SectionContentBloc>]
}>()

const { t } = useTranslation()
const choices = useBlocChoices()

// The room the menu has: the window, without the save bar of the editor fixed at its bottom.
function padding() {
  const saveBar = document.querySelector('[data-blocs-save-bar]')?.getBoundingClientRect().height ?? 0
  return { top: 8, right: 8, bottom: saveBar + 8, left: 8 }
}
const menu = useTemplateRef<ComponentPublicInstance>('menu')
const items = useTemplateRef<ComponentPublicInstance>('items')
const { floatingStyles } = useFloating(menu, items, {
  placement: 'bottom',
  strategy: 'fixed',
  // Positioned by its offsets: its opening transition scales it with `transform`.
  transform: false,
  middleware: [
    offset(8),
    flip(() => ({ padding: padding() })),
    shift(() => ({ padding: padding() })),
    size(() => ({
      padding: padding(),
      apply({ availableHeight, elements }) {
        elements.floating.style.maxHeight = `${Math.max(availableHeight, 160)}px`
      },
    })),
  ],
  // Follows its button at every frame while open: the page can move under it without
  // scrolling or resizing, as an image above loads.
  whileElementsMounted: (reference, floating, update) => autoUpdate(reference, floating, update, { animationFrame: true }),
})

// The choices whose blocs the level accepts (see `ACCEPTED_BLOCS`).
const groups = computed(() => {
  const accepted = ACCEPTED_BLOCS[props.level]
  const all: Array<{ name: string, choices: Array<BlocChoice> }> = [
    { name: t('Mise en page'), choices: [choices.AccordionListBloc] },
    { name: t('Contenus'), choices: [choices.TitleBloc, choices.MarkdownBloc, choices.LinksListBloc, choices.ButtonBloc] },
    { name: t('Contenus à la une'), choices: [choices.DatasetBloc, choices.DataserviceBloc, choices.ReuseBloc] },
  ]
  return all
    .map(group => ({ ...group, choices: group.choices.filter(choice => accepted.includes(choice.key)) }))
    .filter(group => group.choices.length)
})

const objectClass = ref<ObjectBloc['class'] | null>(null)
const isSelectorOpen = ref(false)

function pick(choice: BlocChoice) {
  if ('create' in choice) {
    emit('newBlocs', [choice.create()])
    return
  }
  objectClass.value = choice.key
  isSelectorOpen.value = true
}
</script>
