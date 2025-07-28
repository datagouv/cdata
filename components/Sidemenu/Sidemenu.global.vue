<template>
  <div
    :class="{ 'md:order-2': onRight }"
    class="mb-4 md:mb-0"
  >
    <nav
      class="fr-sidemenu mx-0"
      :class="{ 'fr-sidemenu--right': onRight, 'fr-sidemenu--no-border': !showBorder, 'fr-sidemenu--sticky': fixed, 'fr-sidemenu--sticky-full-height': stickyFullHeight }"
      :aria-labelledby="titleId"
    >
      <Disclosure
        as="div"
        class="fr-sidemenu__inner"
        :default-open="true"
      >
        <DisclosureButton
          class="fr-sidemenu__btn"
        >
          {{ buttonText }}
        </DisclosureButton>
        <DisclosurePanel>
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
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'

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
</script>
