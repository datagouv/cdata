<template>
  <OrganizationHorizontalCard :organization class="organization-card--vertical">
    <template #cover>
      <div class="organization-card__banner" :style="bannerStyle" aria-hidden="true">
        <img
          v-if="bannerImage && !bannerFailed"
          :src="bannerImage"
          alt=""
          :style="{ objectPosition: `center ${bannerPosition}%` }"
          @error="bannerFailed = true"
        />
      </div>
    </template>
  </OrganizationHorizontalCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Organization, OrganizationReference } from '../types/organizations'
import OrganizationHorizontalCard from './OrganizationHorizontalCard.vue'

const props = defineProps<{
  organization: Organization | OrganizationReference
}>()

const bannerFailed = ref(false)
const bannerImage = computed(() =>
  'banner_image' in props.organization ? props.organization.banner_image : null,
)
const bannerPosition = computed(() =>
  'banner_image_position' in props.organization
    ? (props.organization.banner_image_position ?? 50)
    : 50,
)
const bannerStyle = computed(() =>
  'banner_color' in props.organization && props.organization.banner_color
    ? { backgroundColor: props.organization.banner_color }
    : undefined,
)
watch(bannerImage, () => {
  bannerFailed.value = false
})
</script>

<style scoped>
.organization-card--vertical :deep(.object-card__layout) {
  flex-direction: column;
}
.organization-card--vertical :deep(.object-card__body) {
  width: 100%;
}
.organization-card--vertical :deep(.object-card__cover) {
  height: 4rem;
  margin: -1rem -1rem 0;
  overflow: hidden;
  border-radius: 0.1875rem 0.1875rem 0 0;
  background: #f6f6f6;
}
.organization-card--vertical :deep(.object-card__media) {
  position: relative;
  margin-top: -1.5rem;
}
.organization-card__banner,
.organization-card__banner img {
  width: 100%;
  height: 100%;
}
.organization-card__banner img {
  object-fit: cover;
}
</style>
