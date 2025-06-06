<template>
  <div class="fr-p-3w bg-white space-y-6">
    <SimpleBanner type="primary">
      <div class="fr-grid-row">
        <div class="fr-col-auto fr-mr-3v">
          <NuxtImg
            src="/illustrations/success.svg"
            alt=""
            loading="lazy"
          />
        </div>
        <div class="fr-col">
          <p class="fr-m-0 fr-text--bold">
            {{ $t("Your harvester is created, it's waiting the validation from the administration team.") }}
          </p>
          <p class="fr-m-0 fr-text--xs">
            {{ $t("Please notify us via the contact form below if you want this harvester validated. You'll be notify when approved (or refused)") }}
          </p>
        </div>
      </div>
    </SimpleBanner>
    <div class="flex justify-between">
      <BrandedButton
        v-if="config.public.publishingHarvesterFeedbackUrl"
        :href="config.public.publishingHarvesterFeedbackUrl"
        color="secondary-softer"
        :icon="RiLightbulbLine"
        new-tab
      >
        {{ $t('Give us your feedback on the publishing form') }}
      </BrandedButton>
      <div class="fr-grid-row fr-grid-row--right">
        <BrandedButton
          class="mr-3"
          color="secondary"
          :href="getHarvesterAdminUrl(harvester)"
        >
          {{ $t("Go to admin") }}
        </BrandedButton>
        <BrandedButton
          color="primary"
          :href="config.public.harvesterRequestValidationUrl"
          new-tab
        >
          {{ $t("Request validation") }}
        </BrandedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner } from '@datagouv/components-next'
import { RiLightbulbLine } from '@remixicon/vue'
import type { HarvesterSource } from '~/types/harvesters'

defineProps<{
  harvester: HarvesterSource
}>()

const config = useRuntimeConfig()
</script>
