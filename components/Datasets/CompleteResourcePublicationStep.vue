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
            {{ $t("Votre ressource communautaire a été créée !") }}
          </p>
          <p class="fr-m-0 fr-text--xs">
            {{ $t("Voir sur la page publique.") }}
          </p>
        </div>
      </div>
    </SimpleBanner>

    <FileCard
      :model-value="resourceToForm(resource, schemas ?? [])"
      :show-edit-and-warning="false"
      :extensions="extensions ?? []"
    />

    <div class="flex justify-end">
      <BrandedButton
        color="primary"
        :href="getResourceExternalUrl(resource.dataset, resource)"
      >
        {{ $t("Voir la page publique") }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, getResourceExternalUrl, SimpleBanner, type CommunityResource, type SchemaResponseData } from '@datagouv/components-next'

defineProps<{
  resource: CommunityResource
}>()

const { data: extensions } = await useAPI<Array<string>>('/api/1/datasets/extensions/')
const { data: schemas } = await useAPI<SchemaResponseData>('/api/1/datasets/schemas/')
</script>
