<template>
  <section
    id="exemples"
    class="card-examples"
  >
    <h2>Exemples de comparaison</h2>
    <p>Données fictives et stables pour comparer les cartes. Les liens de ces exemples restent dans cette galerie.</p>
    <nav
      aria-label="Types de cartes de démonstration"
      class="example-navigation"
    >
      <a href="#exemples-datasets">Jeux de données</a>
      <a href="#exemples-apis">API</a>
      <a href="#exemples-organisations">Organisations</a>
      <a href="#exemples-reutilisations">Réutilisations</a>
    </nav>

    <h3 id="exemples-datasets">
      Jeux de données
    </h3>
    <div class="example-grid not-prose">
      <div
        v-for="example in exampleDatasets"
        :key="example.data.id"
        class="example-case"
      >
        <p class="example-label">
          {{ example.label }}
        </p>
        <DatasetCard
          :dataset="example.data"
          :organization-url="example.organizationUrl"
        />
      </div>
    </div>

    <h3 id="exemples-apis">
      API et qualité des métadonnées
    </h3>
    <div class="example-grid not-prose">
      <div
        v-for="example in exampleDataservices"
        :key="example.data.id"
        class="example-case"
      >
        <p class="example-label">
          {{ example.label }}
        </p>
        <DataserviceCard :dataservice="example.data" />
      </div>
    </div>

    <h3 id="exemples-organisations">
      Organisations — cartes verticales
    </h3>
    <div class="example-grid not-prose">
      <div
        v-for="example in exampleOrganizations"
        :key="example.data.id"
        class="example-case"
      >
        <p class="example-label">
          {{ example.label }}
        </p>
        <OrganizationCard :organization="example.data" />
      </div>
    </div>
    <h3>Organisations — cartes horizontales</h3>
    <div class="example-grid not-prose">
      <div
        v-for="example in exampleOrganizations"
        :key="example.data.id"
        class="example-case"
      >
        <p class="example-label">
          {{ example.label }}
        </p>
        <OrganizationHorizontalCard :organization="example.data" />
      </div>
    </div>

    <h3 id="exemples-reutilisations">
      Réutilisations — cartes verticales
    </h3>
    <div class="example-grid example-grid-three not-prose">
      <div
        v-for="example in exampleReuses"
        :key="example.data.id"
        class="example-case"
      >
        <p class="example-label">
          {{ example.label }}
        </p>
        <ReuseCard :reuse="example.data" />
      </div>
    </div>
    <h3>Réutilisations — cartes horizontales</h3>
    <div class="example-grid not-prose">
      <div
        v-for="example in exampleReuses"
        :key="example.data.id"
        class="example-case"
      >
        <p class="example-label">
          {{ example.label }}
        </p>
        <ReuseHorizontalCard :reuse="example.data" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { DatasetCard, DataserviceCard, OrganizationCard, OrganizationHorizontalCard, ReuseCard, ReuseHorizontalCard } from '@datagouv/components-next'
import { exampleDatasets, exampleDataservices, exampleOrganizations, exampleReuses } from '~/utils/design/cardExamples'
</script>

<style scoped>
.card-examples { margin-block: 2rem 3rem; }
.card-examples h3 { margin-block: 2rem 1rem; scroll-margin-top: 2rem; }
.example-navigation { display: flex; flex-wrap: wrap; gap: .75rem 1.5rem; }
.example-grid { display: grid; gap: 1.5rem; align-items: start; }
.example-case { min-width: 0; }
.example-label { margin: 0 0 .5rem; color: #666; font-size: .875rem; line-height: 1.5; }
@media (min-width: 62rem) { .example-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 80rem) { .example-grid-three { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
</style>
