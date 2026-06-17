<template>
  <div />
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'

const props = defineProps<{
  organization: Organization
}>()

const route = useRoute()

// Land on the editorial presentation when it is published, otherwise fall back to
// the datasets tab. Admins follow the same rule: an unpublished draft is not a
// landing page, they reach it through the always-visible "Présentation" tab. The
// publication date is in the default mask, so this needs no extra API call and the
// heavy blocs are only fetched on the presentation page itself.
const target = isOrganizationPresentationPublished(props.organization.blocs_published_at) ? 'presentation' : 'datasets'
await navigateTo(`/organizations/${route.params.oid}/${target}`, { replace: true })
</script>
