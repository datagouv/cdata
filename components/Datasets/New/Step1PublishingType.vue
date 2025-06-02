<template>
  <div class="container bg-white mx-0 py-4">
    <h1 class="text-sm font-bold uppercase mb-3">
      {{ $t("Publishing type") }}
    </h1>
    <SimpleBanner
      v-if="config.public.demoServer?.name"
      type="primary"
      class="mb-6"
    >
      <span
        class="fr-icon-info-line fr-mr-1w"
        aria-hidden="true"
      />
      <i18n-t
        keypath="If you want to do tests, use {demo_server}."
        scope="global"
      >
        <template #demo_server>
          <a :href="config.public.demoServer.url">{{ config.public.demoServer.name }}</a>
        </template>
      </i18n-t>
    </SimpleBanner>

    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-6">
        <ActionCard
          :title="$t('Publish a dataset')"
          :content="$t('Administration or public society, everybody can publish on {site} !', { site: config.public.title })"
          icon="/illustrations/dataset.svg"
          actions-alignment="end"
          :stretch-height="true"
        >
          <template #actions>
            <BrandedButton
              color="primary"
              @click="$emit('start')"
            >
              {{ $t("Start publishing") }}
            </BrandedButton>
          </template>
        </ActionCard>
      </div>
      <div class="fr-col-12 fr-col-md-6">
        <ActionCard
          :title="$t('Publish with a schema')"
          :content="$t('Are your data following a reference schema ? Validate, correct and publish your data on {site} !', { site: config.public.title })"
          icon="/illustrations/schema.svg"
          actions-alignment="end"
          :stretch-height="true"
        >
          <template #actions>
            <BrandedButton
              color="secondary"
              :href="config.public.schemaPublishingUrl"
            >
              {{ $t("Use our dedicated tool") }}
            </BrandedButton>
          </template>
        </ActionCard>
      </div>
    </div>
  </div>
  <section
    class="fr-mt-3w"
    aria-labelledby="documentation-links"
  >
    <h2
      id="documentation-links"
      class="fr-m-0 fr-mb-3v fr-text--md fr-text--bold"
    >
      {{ $t("Are you an administration and do you want to automate your data publishing ?") }}
    </h2>
    <p class="fr-m-0 fr-mb-3v">
      {{ $t("You can automatically publish via API or by linking your open data portal to {site} with an harvester.", { site: config.public.title }) }}
    </p>
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-auto">
        <p class="fr-m-0">
          <a
            class="fr-link"
            :href="config.public.apiDocExternalLink"
            target="_blank"
          >{{ $t("See API documentation") }}</a>
        </p>
      </div>
      <div class="fr-col-auto">
        <p class="fr-m-0">
          <a
            class="fr-link"
            :href="config.public.guidesHarvestingUrl"
            target="_blank"
          >{{ $t("Learn more about harvesting") }}</a>
        </p>
      </div>
      <div class="fr-col-auto">
        <p class="fr-m-0">
          <a
            class="fr-link"
            :href="config.public.supportUrl"
            target="_blank"
          >{{ $t("Contact us") }}</a>
        </p>
      </div>
    </div>
  </section>
  <section
    class="fr-mt-5w"
    aria-labelledby="cataloging-links"
  >
    <h2
      id="cataloging-links"
      class="fr-m-0 fr-mb-3v fr-text--md fr-text--bold"
    >
      {{ $t("Are you an administration and do you want to catalog your data ?") }}
    </h2>
    <p class="fr-m-0 fr-mb-3v">
      {{ $t("You can use the service for central administrations to manage and open their data catalog.", { site: config.public.title }) }}
    </p>
    <p class="fr-m-0">
      <a
        class="fr-link"
        :href="config.public.catalogUrl"
        target="_blank"
      >{{ $t("Go to cataloging space") }}</a>
    </p>
  </section>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner } from '@datagouv/components-next'
import ActionCard from '~/components/ActionCard/ActionCard.vue'

defineEmits<{
  (e: 'start'): void
}>()

const config = useRuntimeConfig()
</script>
