<template>
  <Combobox
    v-model="selectedItem"
    as="div"
    class="relative"
    nullable
  >
    <!--
      `nullable` is required here because otherwise the Combobox will set the active value on click outside
      See the listener here for the blur event https://github.com/tailwindlabs/headlessui/blob/%40headlessui/vue%40v1.7.23/packages/%40headlessui-vue/src/components/combobox/combobox.ts#L1250-L1252
      This is probably a bug in HeadlessUI https://github.com/tailwindlabs/headlessui/issues/3615
    -->
    <div
      class="relative w-full bg-white sm:text-sm"
    >
      <ComboboxInput
        class="w-full border-none bg-gray-lower rounded-tl py-2 px-4 text-base text-gray-plain focus:outline-offset-2 focus:outline-2 focus:outline-blue-outline shadow-input-blue placeholder:italic placeholder:text-gray-medium"
        :display-value="() => ''"
        :placeholder="$t('Recherche')"
        @change="query = $event.target.value"
      />
      <ComboboxButton
        class="absolute right-0 p-2 bg-datagouv rounded-tr hover:!bg-datagouv-hover"
      >
        <RiSearchLine
          class="h-6 w-6 text-white"
          aria-hidden="true"
        />
      </ComboboxButton>
    </div>
    <TransitionRoot
      leave="transition ease-in duration-100"
      leave-from="opacity-100"
      leave-to="opacity-0"
      class="absolute z-10 w-full"
      @after-leave="query = ''"
    >
      <ComboboxOptions
        class="list-none pl-0 text-left mt-1 mb-0 max-h-60 overflow-auto rounded-md bg-white text-base shadow-lg focus:outline-none sm:text-sm"
      >
        <ComboboxOption
          v-for="item in menu"
          :key="item.type"
          v-slot="{ active }"
          as="template"
          :value="item"
        >
          <li
            class="relative cursor-default select-none px-4 hover:bg-gray-some *:last:border-0"
            :class="{ 'text-datagouv': active }"
          >
            <div class="flex items-center space-x-2 border-b py-3">
              <component
                :is="item.icon"
                class="h-4 w-4"
              />
              <i18n-t
                v-if="query"
                keypath="Rechercher « {query} » dans les {type}"
                class="flex-1"
                tag="div"
                scope="global"
              >
                <template #query>
                  <em>{{ query }}</em>
                </template>
                <template #type>
                  <strong>{{ item.type }}</strong>
                </template>
              </i18n-t>
              <i18n-t
                v-else
                keypath="Commencer à taper pour rechercher parmi les {type}"
                class="flex-1"
                tag="div"
                scope="global"
              >
                <template #type>
                  <strong>{{ item.type }}</strong>
                </template>
              </i18n-t>
              <div aria-hidden="true">
                <RiArrowRightSLine class="h-4 w-4" />
              </div>
            </div>
          </li>
        </ComboboxOption>
      </ComboboxOptions>
    </TransitionRoot>
  </Combobox>
</template>

<script setup lang="ts">
import { RiArrowRightSLine, RiDatabase2Line, RiBuilding2Line, RiLineChartLine, RiRobot2Line, RiSearchLine } from '@remixicon/vue'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, TransitionRoot } from '@headlessui/vue'
import type { Component } from 'vue'

type Item = {
  icon: Component
  type: string
  to: string
  external: boolean
}

const emit = defineEmits<{
  selected: []
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const query = ref('')
const selectedItem = ref<null | Item>(null)

watch(selectedItem, async () => {
  if (!selectedItem.value) return
  await navigateTo(selectedItem.value.to, { external: selectedItem.value.external })
  emit('selected')
})
const menu = computed(() => {
  return [
    {
      icon: RiDatabase2Line,
      type: t('jeux de données'),
      to: localePath({
        path: '/datasets/search/',
        query: { q: query.value.trim() },
      }),
    },
    {
      icon: RiRobot2Line,
      type: t('APIs'),
      to: localePath({
        path: '/dataservices/search/',
        query: { q: query.value.trim() },
      }),
    },
    {
      icon: RiLineChartLine,
      type: t('réutilisations'),
      to: localePath({
        path: '/reuses/search/',
        query: { q: query.value.trim() },
      }),
    },
    {
      icon: RiBuilding2Line,
      type: t('organisations'),
      to: localePath({
        path: '/organizations/',
        query: { q: query.value.trim() },
      }),
    },
  ]
})
</script>
