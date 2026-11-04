<template>
  <div class="fr-grid-row fr-grid-row--gutters">
    <div
      v-if="!columns.length"
      class="bg-warning-lightest text-warning-dark p-3 mb-4"
    >
      <p class="fr-grid-row fr-m-0">
        <span
          class="fr-icon-warning-line"
          aria-hidden="true"
        />
        {{ t("Aucune structure de données détectée pour ce fichier.") }}
      </p>
    </div>
    <div
      v-for="column in columns"
      :key="column.name"
      class="fr-col-12 fr-col-sm-6 fr-col-md-4 fr-col-lg-3"
    >
      <h5 class="fr-text--sm fr-text--bold fr-mt-0 fr-mb-1v">
        {{ column.name }}
      </h5>
      <code
        v-if="column.format"
        class="code"
      >
        {{ column.format }}
      </code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/useTranslation'

// The column list of the "Structure des données" tab, whatever it comes from
// (the tabular profile, a WFS schema…).
defineProps<{
  columns: Array<{ name: string, format?: string }>
}>()

const { t } = useTranslation()
</script>
