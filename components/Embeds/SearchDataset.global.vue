<template>
  <LoadingBlock
    :status
    class="bg-transparent"
  >
    <div v-if="organization">
      <h2 class="!text-sm !mb-2.5">
        {{ $t(`Jeux de données de l'organisation`) }} {{ organization.name }}
      </h2>
      <DatasetsSearchPage :organization="organization" />
    </div>
  </LoadingBlock>
</template>

<script setup lang="ts">
import { LoadingBlock, type Organization } from '@datagouv/components-next'

const props = defineProps<{
  slug: string
}>()

const url = computed(() => `/api/1/organizations/${props.slug}/`)
const { data: organization, status } = await useAPI<Organization>(url, { lazy: true, server: false })
</script>
