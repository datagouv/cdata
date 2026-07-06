<template>
  <span v-if="!statut">-</span>
  <CdataLink
    v-else-if="linksToData && url"
    :to="url"
    external
    target="_blank"
    rel="noopener"
    class="no-underline fr-raw-link"
  >
    <AdminBadge
      :type="type"
      :icon-right="RiExternalLinkLine"
      size="sm"
    >
      {{ statut }}
    </AdminBadge>
  </CdataLink>
  <AdminBadge
    v-else
    :type="type"
    size="sm"
  >
    {{ statut }}
  </AdminBadge>
</template>

<script setup lang="ts">
import { RiExternalLinkLine } from '@remixicon/vue'
import CdataLink from '~/components/CdataLink.vue'
import AdminBadge from '~/components/AdminBadge/AdminBadge.vue'
import type { AdminBadgeType } from '~/types/types'

// Presentation only: the status → colour / links-to-data mapping is owned by the
// hosting page (single source of truth in its STATUTS list) and passed in.
defineProps<{
  statut: string | null
  url: string | null
  type: AdminBadgeType
  linksToData: boolean
}>()
</script>
