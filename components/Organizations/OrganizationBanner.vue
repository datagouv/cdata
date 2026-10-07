<template>
  <div
    data-testid="organization-banner"
    class="relative bg-cover h-40 sm:h-[230px]"
    :style="bannerStyle"
  >
    <div
      v-if="hasImage"
      class="absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-black/35 to-transparent pointer-events-none"
    />
    <div
      class="container relative h-full flex flex-col justify-between py-3"
      :class="textClass"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'
import { BANNER_DEFAULT_COLOR, isDarkColor } from '~/utils/organizationBanner'

const props = defineProps<{
  organization: Organization
  // Local preview while repositioning; overrides the saved position.
  positionOverride?: number | null
}>()

const hasImage = computed(() => !!props.organization.banner_image)

const bannerStyle = computed(() => {
  if (hasImage.value) {
    // Full position inline, NOT the bg-center class: this build marks
    // background-position utilities !important, which would override the
    // inline longhand and freeze the image at 50%.
    return {
      backgroundImage: `url("${props.organization.banner_image}")`,
      backgroundPosition: `center ${props.positionOverride ?? props.organization.banner_image_position ?? 50}%`,
    }
  }
  return { backgroundColor: props.organization.banner_color ?? BANNER_DEFAULT_COLOR }
})

// `org-banner--on-dark` flips the breadcrumb link colors (style block below).
const textClass = computed(() => {
  if (hasImage.value) return 'org-banner--on-dark'
  return isDarkColor(props.organization.banner_color ?? BANNER_DEFAULT_COLOR) ? 'org-banner--on-dark' : ''
})
</script>

<style>
/* Intentionally unscoped: the slot content (DSFR breadcrumb) lives outside
   this component, and the flip must reach its links. */
.org-banner--on-dark .fr-breadcrumb__link,
.org-banner--on-dark .fr-breadcrumb__link:hover,
.org-banner--on-dark .fr-breadcrumb__link[aria-current="page"],
.org-banner--on-dark .fr-breadcrumb__link[aria-current]:not([aria-current="false"]) {
  color: #fff;
}
</style>
