<template>
  <div
    v-for="(bloc, index) in page.blocs"
    :key="index"
    class="py-24 space-y-6"
  >
    <div>
      <div class="text-gray-title text-3xl font-bold">
        {{ bloc.title }}
      </div>
      <div
        v-if="bloc.subtitle"
        class="text-gray-plain"
      >
        {{ bloc.subtitle }}
      </div>
    </div>
    <div class="grid sm:grid-cols-2 gap-5">
      <DatasetCardLg
        v-for="dataset in bloc.datasets"
        :key="dataset.id"
        :dataset
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Page } from '~/types/pages'

defineProps<{
  page: Page
}>()
</script>
