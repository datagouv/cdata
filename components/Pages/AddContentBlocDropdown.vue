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
      <MenuItems
        class="absolute left-0 z-50 mt-2 w-80 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden"
      >
        <MenuItem
          v-for="key in contentBlocKeys"
          :key="blocsTypes[key].name"
          v-slot="{ active }"
        >
          <button
            class="block px-4 py-2 text-sm w-full text-left space-y-1"
            :class="[active ? 'bg-gray-100 text-gray-900 outline-hidden' : 'text-gray-700']"
            type="button"
            :data-testid="`add-content-${key}`"
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
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { v4 as uuidv4 } from 'uuid'
import type { ContentBloc } from '~/types/pages'

defineEmits<{
  newBloc: [ContentBloc]
}>()

const blocsTypes = useContentBlocsTypes()
const contentBlocKeys = Object.keys(blocsTypes) as Array<keyof typeof blocsTypes>
</script>
