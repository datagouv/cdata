<template>
  <div
    v-if="recommendation"
    data-track-content
    data-content-name="external recommendations"
    :data-content-piece="recommendation.id"
    :data-content-target="recommendation.id"
    class="bg-blue-lightest py-12"
  >
    <div class="container border-l-4 border-primary flex flex-col sm:flex-row sm:items-end sm:justify-between gap-12">
      <div class="text-primary">
        <h3 class="text-2xl">
          {{ recommendation.title }}
        </h3>
        <p class="italic text-xl font-spectral mb-0">
          {{ recommendation.message }}
        </p>
      </div>
      <BrandedButton
        external
        :href="recommendation.url"
        :icon="RiExternalLinkFill"
        icon-right
      >
        {{ recommendation.button }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, useTranslation, type DatasetV2WithFullObject } from '@datagouv/components-next'
import { RiExternalLinkFill } from '@remixicon/vue'
import type { ExternalRecommendation } from '~/types/recommendations'

const props = defineProps<{ dataset: DatasetV2WithFullObject }>()

const { locale } = useTranslation()
const shortLocale = computed(() => locale.split('-')[0])

const recommendation = computed(() => {
  const recommendations = props.dataset.extras['recommendations-externals'] as Array<ExternalRecommendation> || null
  if (!recommendations || !recommendations.length) return

  const recommendation = recommendations[0]

  const locale = shortLocale.value in recommendation.messages ? shortLocale.value : 'fr'
  return {
    id: recommendation.id,
    title: recommendation.messages[locale].title,
    message: recommendation.messages[locale].message,
    button: recommendation.messages[locale].button,
    url: recommendation.id,
  }
})
</script>
