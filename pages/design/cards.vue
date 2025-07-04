<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design/">
        {{ $t('Design System') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/cards">
        {{ $t('Cards') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Cards
    </h1>

    <h2 class="mb-3">
      Dataset
    </h2>
    <div class="not-prose space-y-4">
      <EmbedsDatasetCard slug="municipales-2020-resultats-2nd-tour" />
      <EmbedsDatasetCard slug="elections-municipales-2020-liste-des-candidats-elus-au-t1-et-liste-des-communes-entierement-pourvues" />
    </div>

    <h2 class="mb-3">
      Dataservice
    </h2>
    <div class="not-prose space-y-4">
      <EmbedsDataserviceCard slug="api-tabulaire-data-gouv-fr-beta" />
      <EmbedsDataserviceCard slug="api-sirene-open-data" />
    </div>

    <h2 class="mb-3">
      Reuse
    </h2>
    <div class="my-4 not-prose grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <EmbedsReuseCard
        class="flex-1"
        slug="datafrance-plateforme-de-visualisation-open-data"
      />
      <EmbedsReuseCard
        class="flex-1"
        slug="lannuaire-des-entreprises"
      />
      <EmbedsReuseCard
        class="flex-1"
        slug="geozones"
      />
    </div>

    <h2 class="mb-3">
      Organization
    </h2>
    <div class="my-4 not-prose grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <EmbedsOrganizationCard
        class="flex-1"
        slug="sante-publique-france"
      />
      <EmbedsOrganizationCard
        class="flex-1"
        slug="autorite-de-regulation-des-communications-electroniques-des-postes-et-de-la-distribution-de-la-presse-arcep"
      />
      <EmbedsOrganizationCard
        class="flex-1"
        slug="sncf"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
</script>
