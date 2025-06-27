<template>
  <div class="fr-p-3w bg-white space-y-6">
    <SimpleBanner type="primary">
      <div class="fr-grid-row">
        <div class="fr-col-auto fr-mr-3v">
          <NuxtImg
            src="/illustrations/success.svg"
            loading="lazy"
            alt=""
          />
        </div>
        <div class="fr-col">
          <p class="fr-m-0 fr-text--bold">
            {{ $t('Your dataset is created!') }}
          </p>
          <p class="fr-m-0 fr-text--xs">
            {{ $t('Vous pouvez maintenant le publier ou le sauvegarder en brouillon.') }}
          </p>
        </div>
      </div>
    </SimpleBanner>
    <DatasetCardLg :dataset="publicDataset" />
    <div class="fr-grid-row justify-between">
      <BrandedButton
        v-if="config.public.publishingDatasetFeedbackUrl"
        :href="config.public.publishingDatasetFeedbackUrl"
        :icon="RiLightbulbLine"
        color="secondary-softer"
        new-tab
      >
        {{ $t('Donnez-nous votre avis sur le parcours de publication') }}
      </BrandedButton>
      <div class="fr-grid-row fr-grid-row--right">
        <BrandedButton
          class="mr-3"
          color="secondary"
          :disabled="loading"
          @click="submit(true)"
        >
          {{ $t("Sauvegarder le brouillon") }}
        </BrandedButton>
        <BrandedButton
          :loading
          color="primary"
          @click="submit(false)"
        >
          {{ $t("Publish the dataset") }}
        </BrandedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { SimpleBanner, type Dataset } from '@datagouv/components-next'
import { RiLightbulbLine } from '@remixicon/vue'

const props = defineProps<{
  dataset: Dataset
  loading: boolean
}>()

const publicDataset = computed(() => ({ ...props.dataset, private: false }))

const emit = defineEmits<{
  (e: 'next', asPrivate: boolean): void
}>()

const config = useRuntimeConfig()

function submit(asPrivate: boolean) {
  emit('next', asPrivate)
};
</script>
