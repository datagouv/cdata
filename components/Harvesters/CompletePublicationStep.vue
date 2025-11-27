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
            {{ $t("Votre moissonneur a été créé, il est en attente de validation par l’équipe d’administration.") }}
          </p>
          <p class="fr-m-0 fr-text--xs">
            {{ $t("Merci de nous informer via le formulaire de contact suivant si vous souhaitez que nous validions votre moissonneur. Vous serez notifié à l’approbation (ou au refus).") }}
          </p>
        </div>
      </div>
    </SimpleBanner>
    <div class="flex justify-between">
      <BrandedButton
        v-if="config.public.publishingHarvesterFeedbackUrl"
        :href="config.public.publishingHarvesterFeedbackUrl"
        color="tertiary"
        :icon="RiLightbulbLine"
        new-tab
      >
        {{ $t('Donnez-nous votre avis sur le parcours de publication') }}
      </BrandedButton>
      <div class="fr-grid-row fr-grid-row--right">
        <BrandedButton
          class="mr-3"
          color="secondary"
          :href="getHarvesterAdminUrl(harvester)"
        >
          {{ $t("Se rendre sur l'administration") }}
        </BrandedButton>
        <BrandedButton
          color="primary"
          :href="config.public.harvesterRequestValidationUrl"
          new-tab
        >
          {{ $t("Demander la validation") }}
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
