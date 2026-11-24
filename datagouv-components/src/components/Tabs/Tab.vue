<template>
  <Tab
    v-slot="{ selected }"
    as="template"
  >
    <button
      v-if="underline"
      class="flex items-center gap-2 py-2 px-1 text-sm hover:bg-transparent"
      :class="selected ? 'text-new-primary font-bold border-b-2 border-b-new-primary -mb-px' : 'text-gray-medium hover:text-gray-title'"
    >
      <slot />
    </button>
    <button
      v-else
      class="fr-segmented__element"
      :class="{ selected: selected }"
    >
      <div class="inner">
        <slot />
      </div>
    </button>
  </Tab>
</template>

<script setup lang="ts">
import { Tab } from '@headlessui/vue'
import { inject, ref } from 'vue'
import { tabsUnderlineInjectionKey } from './tabsContext'

const underline = inject(tabsUnderlineInjectionKey, ref(false))
</script>

<style scoped>
.fr-segmented__element {
    display: inline-flex;
    align-items: center;
    border-radius: .25rem;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.5rem;
    padding: .25rem 0.25rem;
    white-space: nowrap;
}

.tabs-sm .fr-segmented__element {
    font-size: .875rem;
    line-height: 1.5rem;
}

.fr-segmented__element.selected {
    box-shadow: inset 0 0 0 1px var(--border-active-blue-france);
    color: var(--text-active-blue-france);
    z-index: 1;
}

.fr-segmented__element:hover {
    background-color: transparent;
}

.fr-segmented__element .inner {
    width: 100%;
    padding: .25rem .75rem;
    border-radius: .25rem;
}

.tabs-sm .fr-segmented__element .inner {
    padding: 0rem .5rem;

}

.fr-segmented__element:not(.selected):hover .inner {
    background-color: var(--hover);
}
</style>
