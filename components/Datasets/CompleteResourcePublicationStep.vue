<template>
  <div class="fr-p-3w bg-white">
    <SimpleBanner
      type="primary"
      class="mb-6"
    >
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
            {{ $t("Your community resource is created!") }}
          </p>
          <p class="fr-m-0 fr-text--xs">
            {{ $t("You can now see it in the public page.") }}
          </p>
        </div>
      </div>
    </SimpleBanner>

    <FileCard
      :model-value="resourceToForm(resource, schemas)"
      :show-edit-and-warning="false"
      :extensions
    />

    <div class="mt-6 flex justify-end">
      <BrandedButton
        color="primary"
        :href="getResourceExternalUrl(resource.dataset, resource)"
        external
      >
        {{ $t("Go to public page") }}
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
