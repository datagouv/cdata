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
import { BANNER_DEFAULT_COLOR, isDarkColor, normalizeHexColor } from '~/utils/organizationBanner'

const props = defineProps<{
  organization: Organization
  // Local preview while repositioning; overrides the saved position.
  positionOverride?: number | null
}>()

const hasImage = computed(() => !!props.organization.banner_image)

// banner_color comes from the API: normalize it once so neither the SSR'd
// style attribute (CSS injection) nor the contrast check sees the raw string.
const bannerColor = computed(() => (props.organization.banner_color ? normalizeHexColor(props.organization.banner_color) : null) ?? BANNER_DEFAULT_COLOR)

const bannerStyle = computed(() => {
  if (hasImage.value) {
    return {
      backgroundImage: `url("${props.organization.banner_image}")`,
      backgroundPosition: `center ${props.positionOverride ?? props.organization.banner_image_position ?? 50}%`,
    }
  }
  return { backgroundColor: bannerColor.value }
})

// `org-banner--on-dark` / `--on-light` flip the breadcrumb link colors (style
// block below); the class must come from the same normalized color as the
// background so text and backdrop never disagree.
const textClass = computed(() => {
  if (hasImage.value) return 'org-banner--on-dark'
  return isDarkColor(bannerColor.value) ? 'org-banner--on-dark' : 'org-banner--on-light'
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

.org-banner--on-light .fr-breadcrumb__link,
.org-banner--on-light .fr-breadcrumb__link:hover,
.org-banner--on-light .fr-breadcrumb__link[aria-current="page"],
.org-banner--on-light .fr-breadcrumb__link[aria-current]:not([aria-current="false"]) {
  color: #161616;
}
</style>
