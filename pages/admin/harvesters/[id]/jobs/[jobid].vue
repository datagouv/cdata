<template>
  <JobPage
    v-if="job"
    :job
  />
</template>

<script setup lang="ts">
import JobPage from '~/components/Harvesters/JobPage.vue'
import type { HarvesterJob } from '~/types/harvesters'

const route = useRoute()
const url = computed(() => `/api/1/harvest/job/${route.params.jobid}/`)
const { data: job } = await useAPI<HarvesterJob>(url, { lazy: true })
</script>
