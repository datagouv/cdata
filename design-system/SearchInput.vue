<template>
  <section class="space-y-3">
    <h2>
      SearchInput
    </h2>
    <SearchInput
      v-model="model"
      placeholder="With custom placeholder"
    />
  </section>
</template>

<script setup lang="ts">
const model = ref('')
</script>
