<template>
  <NuxtPage
    :organization
    @refresh="refresh"
  />
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'

const { setCurrentOrganization } = useCurrentOwned()

const route = useRoute()
const url = computed(() => `api/1/organizations/${route.params.oid}/`)
const { data: organization, refresh } = await useAPI<Organization>(url, { redirectOn404: true })

watch(organization, () => {
  if (organization.value) setCurrentOrganization(organization.value)
}, { immediate: true })
</script>
