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
            {{ $t('Your reuse is created!') }}
          </p>
          <p class="fr-m-0 fr-text--xs">
            {{ $t('You can now publish it or save it as a draft.') }}
          </p>
        </div>
      </div>
    </SimpleBanner>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <ReuseCard
        :reuse
        class="xl:col-start-2"
      />
    </div>
    <div class="flex justify-between">
      <BrandedButton
        v-if="config.public.publishingReuseFeedbackUrl"
        :href="config.public.publishingReuseFeedbackUrl"
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
          :disabled="loading"
          @click="submit(true)"
        >
          {{ $t("Save as draft") }}
        </BrandedButton>
        <BrandedButton
          :loading
          color="primary"
          @click="submit(false)"
        >
          {{ $t("Publish the reuse") }}
        </BrandedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { SimpleBanner, type Reuse } from '@datagouv/components-next'
import { RiLightbulbLine } from '@remixicon/vue'
import ReuseCard from '~/components/Reuses/ReuseCard.vue'

defineProps<{
  reuse: Reuse
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'next', asPrivate: boolean): void
}>()

const config = useRuntimeConfig()

function submit(asPrivate: boolean) {
  emit('next', asPrivate)
};
</script>
