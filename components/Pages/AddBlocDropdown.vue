<template>
  <Menu
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
      <MenuItems class="overflow-hidden absolute right-0 z-10 mt-2 w-96 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden">
        <div
          v-for="groupOfBloc in newBlocsTypes"
          :key="groupOfBloc.name"
        >
          <div class="px-4 py-2 uppercase font-bold bg-gray-lowest-2 text-sm border-b border-gray-default">
            {{ groupOfBloc.name }}
          </div>
          <MenuItem
            v-for="key in groupOfBloc.blocsTypes"
            :key="blocsTypes[key].name"
            v-slot="{ active }"
          >
            <button
              class="block px-4 py-2 text-sm w-full text-left space-y-1"
              :class="[active ? 'bg-gray-100 text-gray-900 outline-hidden' : 'text-gray-700']"
              type="button"
              @click="$emit('newBloc', { id: uuidv4(), ...blocsTypes[key].default() })"
            >
              <div class="flex space-x-1 items-center text-gray-title">
                <component
                  :is="blocsTypes[key].icon"
                  class="size-4"
                />
                <div class="text-sm">
                  {{ blocsTypes[key].name }}
                </div>
              </div>
              <div class="text-xs text-gray-plain">
                {{ blocsTypes[key].description }}
              </div>
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { v4 as uuidv4 } from 'uuid'
import type { PageBloc } from '~/types/pages'

defineEmits<{
  newBloc: [PageBloc]
}>()
const { t } = useTranslation()
const blocsTypes = useBlocsTypes()

const newBlocsTypes: Array<{ name: string, blocsTypes: Array<keyof typeof blocsTypes> }> = [
  { name: t('Contenus à la une'), blocsTypes: ['DatasetsListBloc', 'ReusesListBloc', 'DataservicesListBloc', 'LinksListBloc'] },
  { name: t('Texte'), blocsTypes: ['MarkdownBloc'] },
]
</script>
