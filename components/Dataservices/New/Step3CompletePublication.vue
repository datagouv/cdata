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
            {{ $t('Votre API a été créée!') }}
          </p>
          <p class="fr-m-0 fr-text--xs">
            {{ $t('Vous pouvez maintenant le publier ou le sauvegarder en brouillon.') }}
          </p>
        </div>
      </div>
    </SimpleBanner>
    <DataserviceCard :dataservice />
    <div class="fr-grid-row justify-between">
      <BrandedButton
        v-if="config.public.publishingDataserviceFeedbackUrl"
        :href="config.public.publishingDataserviceFeedbackUrl"
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
          @click="submit(true)"
        >
          {{ $t("Sauvegarder le brouillon") }}
        </BrandedButton>
        <BrandedButton
          color="primary"
          :loading
          @click="submit(false)"
        >
          {{ $t("Publier l'API") }}
        </BrandedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { SimpleBanner, type Dataservice } from '@datagouv/components-next'
import { RiLightbulbLine } from '@remixicon/vue'
import DataserviceCard from '~/components/Dataservices/Card/Card.vue'

defineProps<{
  dataservice: Dataservice
  loading: boolean
}>()

const emit = defineEmits<{
  next: [asPrivate: boolean]
}>()

const config = useRuntimeConfig()

function submit(asPrivate: boolean) {
  emit('next', asPrivate)
};
</script>
