<template>
  <Combobox
    as="div"
    class="relative"
  >
    <div
      class="relative w-full bg-white sm:text-sm"
    >
      <ComboboxInput
        class="w-full border-none bg-gray-lower rounded-tl py-2 px-4 text-base text-gray-plain focus:outline-offset-2 focus:outline-2 focus:outline-blue-outline shadow-input-blue placeholder:italic placeholder:text-gray-medium"
        :display-value="() => ''"
        :placeholder="$t('Search')"
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
        class="text-left mt-1 max-h-60 overflow-auto rounded-md bg-white text-base shadow-lg focus:outline-none sm:text-sm"
      >
        <ComboboxOption
          v-for="item in menu"
          :key="item.type"
          v-slot="{ active }"
          as="template"
        >
          <li
            class="relative cursor-default select-none px-4 hover:bg-gray-some *:last:border-0"
            :class="{ 'text-datagouv': active }"
          >
            <NuxtLink
              :to="item.to"
              :external="item.external"
              class="flex items-center space-x-2 border-b py-3"
            >
              <component
                :is="item.icon"
                class="h-4 w-4"
              />
              <i18n-t
                v-if="query"
                keypath="Search “{query}” in {type}"
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
                keypath="Start typing to search in {type}"
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
            </NuxtLink>
          </li>
        </ComboboxOption>
      </ComboboxOptions>
    </TransitionRoot>
  </Combobox>
</template>

<script setup lang="ts">
import { RiArrowRightSLine, RiDatabase2Line, RiGovernmentLine, RiLineChartLine, RiRobot2Line, RiSearchLine } from '@remixicon/vue'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, TransitionRoot } from '@headlessui/vue'

const { t } = useI18n()
const localePath = useLocalePath()
const query = ref('')
const menu = computed(() => {
  return [
    {
      icon: RiDatabase2Line,
      type: t('datasets'),
      to: localePath({
        path: '/datasets/',
        query: { q: query.value.trim() },
      }),
      external: true,
    },
    {
      icon: RiRobot2Line,
      type: t('dataservies'),
      to: localePath({
        path: '/dataservices/',
        query: { q: query.value.trim() },
      }),
    },
    {
      icon: RiLineChartLine,
      type: t('reuses'),
      to: localePath({
        path: '/reuses/',
        query: { q: query.value.trim() },
      }),
    },
    {
      icon: RiGovernmentLine,
      type: t('organizations'),
      to: localePath({
        path: '/organizations/',
        query: { q: query.value.trim() },
      }),
    },
  ]
})
</script>
