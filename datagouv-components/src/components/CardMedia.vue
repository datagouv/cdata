<template>
  <div class="card-media" :data-empty="!hasImage" :data-fit="fit">
    <img v-if="hasImage" :src="src!" :alt="alt || ''" loading="lazy" @error="failed = true" />
    <component :is="icon" v-else class="card-media__placeholder" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RiArticleLine, RiBarChartBoxLine, RiLineChartLine } from '@remixicon/vue'

const props = defineProps<{
  src?: string | null
  alt?: string
  kind: 'post' | 'reuse' | 'chart'
  fit?: 'cover' | 'contain'
}>()

const failed = ref(false)
watch(
  () => props.src,
  () => {
    failed.value = false
  },
)
const hasImage = computed(() => !!props.src?.trim() && !failed.value)
const icon = computed(
  () => ({ post: RiArticleLine, reuse: RiLineChartLine, chart: RiBarChartBoxLine })[props.kind],
)
</script>

<style scoped>
.card-media {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  background: #f6f6f6;
  color: #555;
}
.card-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-media[data-fit='contain'] img {
  box-sizing: border-box;
  padding: 1rem;
  object-fit: contain;
}
.card-media__placeholder {
  width: 3rem;
  height: 3rem;
  flex: none;
}
</style>
