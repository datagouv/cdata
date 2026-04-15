<template>
  <div class="fr-input-group">
    <label
      for="theme-filter"
      class="fr-label"
    >
      Thème (custom filter)
    </label>
    <select
      id="theme-filter"
      v-model="value"
      class="fr-select shadow-input-blue!"
    >
      <option :value="undefined">
        Tous les thèmes
      </option>
      <option
        v-for="theme in themes"
        :key="theme.value"
        :value="theme.value"
      >
        {{ theme.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useSearchFilter } from '@datagouv/components-next'

const themes = [
  { value: 'environnement', label: 'Environnement' },
  { value: 'transport', label: 'Transport' },
  { value: 'sante', label: 'Santé' },
  { value: 'education', label: 'Éducation' },
  { value: 'logement', label: 'Logement' },
]

// ?theme=environnement dans l'URL → tag=environnement dans l'API
const value = useSearchFilter('theme', { apiParam: 'tag' })
</script>
