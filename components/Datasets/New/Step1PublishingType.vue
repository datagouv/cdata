<template>
  <div class="container bg-white mx-0 py-4">
    <h1 class="text-sm font-bold uppercase mb-3">
      {{ $t("Type de publication") }}
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
          :title="$t('Publier un jeu de données')"
          :content="$t('Administration ou société publique, tout le monde peut publier sur {site} !', { site: config.public.title })"
          icon="/illustrations/dataset.svg"
          actions-alignment="end"
          :stretch-height="true"
        >
          <template #actions>
            <BrandedButton
              color="primary"
              @click="$emit('start')"
            >
              {{ $t("Commencer la publication") }}
            </BrandedButton>
          </template>
        </ActionCard>
      </div>
      <div class="fr-col-12 fr-col-md-6">
        <ActionCard
          :title="$t('Publier avec un schéma')"
          :content="$t('Vos données suivent-elles un schéma de référence ? Validez, corrigez et publiez vos données sur {site} !', { site: config.public.title })"
          icon="/illustrations/schema.svg"
          actions-alignment="end"
          :stretch-height="true"
        >
          <template #actions>
            <BrandedButton
              color="secondary"
              :href="config.public.schemaPublishingUrl"
            >
              {{ $t("Utiliser notre outil dédié") }}
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
      {{ $t("Êtes-vous une administration et voulez-vous automatiser la publication de vos données ?") }}
    </h2>
    <p class="fr-m-0 fr-mb-3v">
      {{ $t("Vous pouvez publier automatiquement via API ou en liant votre portail de données ouvertes à {site} avec un moissonneur.", { site: config.public.title }) }}
    </p>
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-auto">
        <p class="fr-m-0">
          <a
            class="fr-link"
            :href="config.public.apiDocExternalLink"
            target="_blank"
          >{{ $t("Voir la documentation API") }}</a>
        </p>
      </div>
      <div class="fr-col-auto">
        <p class="fr-m-0">
          <a
            class="fr-link"
            :href="config.public.guidesHarvestingUrl"
            target="_blank"
          >{{ $t("En savoir plus sur le moissonnage") }}</a>
        </p>
      </div>
      <div class="fr-col-auto">
        <p class="fr-m-0">
          <a
            class="fr-link"
            :href="config.public.supportUrl"
            target="_blank"
          >{{ $t("Nous écrire") }}</a>
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
      {{ $t("Êtes-vous une administration et voulez-vous cataloguer vos données ?") }}
    </h2>
    <p class="fr-m-0 fr-mb-3v">
      {{ $t("Vous pouvez utiliser le service pour les administrations centrales pour gérer et ouvrir leur catalogue de données.", { site: config.public.title }) }}
    </p>
    <p class="fr-m-0">
      <a
        class="fr-link"
        :href="config.public.catalogUrl"
        target="_blank"
      >{{ $t("Aller à l'espace de catalogage") }}</a>
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
