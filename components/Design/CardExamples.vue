<template>
  <section
    id="exemples"
    class="mt-8 mb-12"
  >
    <h2>Exemples de comparaison</h2>
    <p>Données fictives et stables pour comparer les cartes. Les liens de ces exemples restent dans cette galerie.</p>
    <nav
      aria-label="Types de cartes de démonstration"
      class="flex flex-wrap gap-x-6 gap-y-3"
    >
      <a href="#exemples-datasets">Jeux de données</a>
      <a href="#exemples-apis">API</a>
      <a href="#exemples-organisations">Organisations</a>
      <a href="#exemples-reutilisations">Réutilisations</a>
    </nav>

    <h3
      id="exemples-datasets"
      class="mt-8 mb-4 scroll-mt-8"
    >
      Jeux de données
    </h3>
    <div class="not-prose grid gap-6 items-start lg:grid-cols-2">
      <div
        v-for="example in exampleDatasets"
        :key="example.data.id"
        class="min-w-0"
      >
        <p class="mb-2 text-sm text-gray-medium">
          {{ example.label }}
        </p>
        <DatasetCard
          :dataset="example.data"
          :organization-url="example.organizationUrl"
        />
      </div>
    </div>

    <h3
      id="exemples-apis"
      class="mt-8 mb-4 scroll-mt-8"
    >
      API et qualité des métadonnées
    </h3>
    <div class="not-prose grid gap-6 items-start lg:grid-cols-2">
      <div
        v-for="example in exampleDataservices"
        :key="example.data.id"
        class="min-w-0"
      >
        <p class="mb-2 text-sm text-gray-medium">
          {{ example.label }}
        </p>
        <DataserviceCard :dataservice="example.data" />
      </div>
    </div>

    <h3
      id="exemples-organisations"
      class="mt-8 mb-4 scroll-mt-8"
    >
      Organisations — cartes verticales
    </h3>
    <div class="not-prose grid gap-6 items-start lg:grid-cols-2">
      <div
        v-for="example in exampleOrganizations"
        :key="example.data.id"
        class="min-w-0"
      >
        <p class="mb-2 text-sm text-gray-medium">
          {{ example.label }}
        </p>
        <OrganizationCard :organization="example.data" />
      </div>
    </div>
    <h3 class="mt-8 mb-4">
      Organisations — cartes horizontales
    </h3>
    <div class="not-prose grid gap-6 items-start lg:grid-cols-2">
      <div
        v-for="example in exampleOrganizations"
        :key="example.data.id"
        class="min-w-0"
      >
        <p class="mb-2 text-sm text-gray-medium">
          {{ example.label }}
        </p>
        <OrganizationCard
          :organization="example.data"
          horizontal
        />
      </div>
    </div>

    <h3
      id="exemples-reutilisations"
      class="mt-8 mb-4 scroll-mt-8"
    >
      Réutilisations — cartes verticales
    </h3>
    <div class="not-prose grid gap-6 items-start lg:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="example in exampleReuses"
        :key="example.data.id"
        class="min-w-0"
      >
        <p class="mb-2 text-sm text-gray-medium">
          {{ example.label }}
        </p>
        <ReuseCard :reuse="example.data" />
      </div>
    </div>
    <h3 class="mt-8 mb-4">
      Réutilisations — cartes horizontales
    </h3>
    <div class="not-prose grid gap-6 items-start lg:grid-cols-2">
      <div
        v-for="example in exampleReuses"
        :key="example.data.id"
        class="min-w-0"
      >
        <p class="mb-2 text-sm text-gray-medium">
          {{ example.label }}
        </p>
        <ReuseCard
          :reuse="example.data"
          horizontal
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { DatasetCard, DataserviceCard, OrganizationCard, ReuseCard } from '@datagouv/components-next'
import { exampleDatasets, exampleDataservices, exampleOrganizations, exampleReuses } from '~/utils/design/cardExamples'
</script>
