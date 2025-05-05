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
const { data: organization, refresh } = await useAPI<Organization>(`api/1/organizations/${route.params.oid}/`, { lazy: true })

watchEffect(() => {
  if (organization.value) setCurrentOrganization(organization.value)
})
</script>
