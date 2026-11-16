<template>
  <span v-if="!statut">-</span>
  <CdataLink
    v-else-if="linksToData && url"
    :to="url"
    external
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="`${statut} — ${t('Voir les données (nouvel onglet)')}`"
    class="inline-flex rounded fr-raw-link active:bg-transparent hover:*:*:underline hover:*:*:decoration-1 hover:*:*:underline-offset-2 focus-visible:outline-(--border-active-blue-france)"
  >
    <AdminBadge
      :type="type"
      :icon-right="RiExternalLinkLine"
      size="xs"
      :no-wrap="false"
    >
      {{ statut }}
    </AdminBadge>
  </CdataLink>
  <AdminBadge
    v-else
    :type="type"
    size="xs"
    :no-wrap="false"
  >
    {{ statut }}
  </AdminBadge>
</template>

<script setup lang="ts">
import { RiExternalLinkLine } from '@remixicon/vue'
import CdataLink from '~/components/CdataLink.vue'
import AdminBadge from '~/components/AdminBadge/AdminBadge.vue'
import type { AdminBadgeType } from '~/types/types'

const { t } = useTranslation()

// Presentation only: the status → colour / links-to-data mapping is owned by the
// hosting page (single source of truth in its STATUTS list) and passed in.
defineProps<{
  statut: string | null
  url: string | null
  type: AdminBadgeType
  linksToData: boolean
}>()
</script>
