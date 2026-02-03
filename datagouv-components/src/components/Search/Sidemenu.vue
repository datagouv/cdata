<template>
  <div :class="{ 'md:order-2': onRight }">
    <nav
      class="fr-sidemenu mx-0"
      :class="{ 'fr-sidemenu--right': onRight, 'fr-sidemenu--no-border': !showBorder, 'fr-sidemenu--sticky': fixed, 'fr-sidemenu--sticky-full-height': stickyFullHeight }"
      :aria-labelledby="titleId"
    >
      <Disclosure
        as="div"
        class="fr-sidemenu__inner"
        :default-open="defaultOpen"
      >
        <DisclosureButton
          ref="buttonRef"
          class="fr-sidemenu__btn"
        >
          {{ buttonText }}
        </DisclosureButton>
        <DisclosurePanel
          ref="panelRef"
          class="pb-4 md:pb-0"
        >
          <div
            :id="titleId"
            class="fr-sidemenu__title !text-sm !mb-3"
          >
            <slot name="title" />
          </div>
          <slot />
        </DisclosurePanel>
      </Disclosure>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, useId, useTemplateRef } from 'vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { useWindowSize, watchDebounced } from '@vueuse/core'

withDefaults(defineProps<{
  fixed?: boolean
  stickyFullHeight?: boolean
  showBorder?: boolean
  onRight?: boolean
  buttonText: string
}>(), {
  fixed: false,
  showBorder: true,
  onRight: false,
})

const titleId = useId()
const buttonRef = useTemplateRef('buttonRef')
const panelRef = useTemplateRef('panelRef')
const { width } = useWindowSize()
const openedAt = 48 * 16 // 48em is the sidemenu breakpoint from the DSFR

const defaultOpen = computed(() => width.value > openedAt)

watchDebounced(width, () => {
  if (defaultOpen.value && panelRef.value && !panelRef.value?.$el) {
    buttonRef.value?.$el.click()
  }
}, { debounce: 200 })
</script>
