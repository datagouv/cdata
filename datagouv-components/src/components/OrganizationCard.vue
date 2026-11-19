<template>
  <ObjectCard
    :url="organization.page"
    :stacked="!horizontal"
  >
    <template
      v-if="!horizontal"
      #cover
    >
      <div
        data-testid="organization-banner"
        class="h-16"
        :class="{ 'bg-gray-some': !bannerColor }"
        :style="bannerColor ? { backgroundColor: bannerColor } : undefined"
        aria-hidden="true"
      >
        <img
          v-if="bannerImage && !bannerFailed"
          :src="bannerImage"
          alt=""
          loading="lazy"
          class="size-full object-cover"
          :style="{ objectPosition: `center ${bannerPosition}%` }"
          @error="bannerFailed = true"
        >
      </div>
    </template>
    <template #media>
      <OrganizationLogo
        :organization
        size-class="size-12 p-1"
      />
    </template>
    <template #title>
      <OrganizationNameInline
        :organization
        :show-type="false"
      />
    </template>
    <template
      v-if="type !== OTHER"
      #badge
    >
      <OrganizationTypeBadge
        :type
        class="max-[480px]:hidden"
      />
    </template>

    <ObjectCardMeta
      v-if="'metrics' in organization"
      class="mt-1 max-[480px]:hidden"
    >
      <ObjectCardMetrics>
        <ObjectCardMetric
          :icon="RiDatabase2Line"
          :value="organization.metrics.datasets"
          :label="t('{n} jeux de données | {n} jeu de données | {n} jeux de données', organization.metrics.datasets)"
        />
        <ObjectCardMetric
          :icon="RiTerminalLine"
          :value="organization.metrics.dataservices"
          :label="t('{n} API', organization.metrics.dataservices)"
        />
        <ObjectCardMetric
          :icon="RiLineChartLine"
          :value="organization.metrics.reuses"
          :label="t('{n} réutilisations | {n} réutilisation | {n} réutilisations', organization.metrics.reuses)"
        />
        <ObjectCardMetric
          :icon="RiStarLine"
          :value="organization.metrics.followers"
          :label="t('{n} abonnés | {n} abonné | {n} abonnés', organization.metrics.followers)"
        />
      </ObjectCardMetrics>
    </ObjectCardMeta>
    <ObjectCardShortDescription
      v-if="'description' in organization"
      :text="organization.description"
      class="mt-1 max-md:hidden"
    />
  </ObjectCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RiDatabase2Line, RiLineChartLine, RiStarLine, RiTerminalLine } from '@remixicon/vue'
import { getOrganizationType, OTHER } from '../functions/organizations'
import type { Organization, OrganizationReference } from '../types/organizations'
import { useTranslation } from '../composables/useTranslation'
import ObjectCard from './ObjectCard.vue'
import ObjectCardMeta from './ObjectCardMeta.vue'
import ObjectCardMetric from './ObjectCardMetric.vue'
import ObjectCardMetrics from './ObjectCardMetrics.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import OrganizationLogo from './OrganizationLogo.vue'
import OrganizationNameInline from './OrganizationNameInline.vue'
import OrganizationTypeBadge from './OrganizationTypeBadge.vue'

const props = defineProps<{
  organization: Organization | OrganizationReference
  /**
   * Puts the logo beside the content, without the banner, for full-width lists.
   * The card falls back to the vertical layout when it gets too narrow.
   */
  horizontal?: boolean
}>()

const { t } = useTranslation()

const type = computed(() => getOrganizationType(props.organization))

const bannerColor = computed(() => 'banner_color' in props.organization ? props.organization.banner_color : null)
const bannerImage = computed(() => 'banner_image' in props.organization ? props.organization.banner_image : null)
const bannerPosition = computed(() => 'banner_image_position' in props.organization ? (props.organization.banner_image_position ?? 50) : 50)

// A broken banner falls back to the plain color instead of the browser's broken image icon.
const bannerFailed = ref(false)
watch(bannerImage, () => {
  bannerFailed.value = false
})
</script>
