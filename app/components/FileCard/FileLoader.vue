<script setup lang="ts">
import { ContentLoader } from 'vue-content-loader'
</script>

<template>
  <content-loader
    width="88"
    height="40"
    :speed="2"
    primary-color="#f3f3f3"
    secondary-color="#ecebeb"
  >
    <circle
      cx="20"
      cy="20"
      r="20"
    />
    <circle
      cx="68"
      cy="20"
      r="20"
    />
  </content-loader>
</template>
