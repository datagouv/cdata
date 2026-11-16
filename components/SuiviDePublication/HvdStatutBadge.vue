<template>
  <span v-if="!statut">-</span>
  <Badge
    v-else
    :to="linksToData ? url : null"
    :external="linksToData && url ? true : undefined"
    :target="linksToData && url ? '_blank' : undefined"
    :rel="linksToData && url ? 'noopener noreferrer' : undefined"
    :aria-label="linksToData && url ? `${statut} — ${t('Voir les données (nouvel onglet)')}` : undefined"
    :tone
    :icon-right="linksToData && url ? RiExternalLinkLine : null"
    size="xs"
    wrap
  >
    {{ statut }}
  </Badge>
</template>

<script setup lang="ts">
import { Badge, type BadgeTone } from '@datagouv/components-next'
import { RiExternalLinkLine } from '@remixicon/vue'

const { t } = useTranslation()

// Presentation only: the status → colour / links-to-data mapping is owned by the
// hosting page (single source of truth in its STATUTS list) and passed in.
defineProps<{
  statut: string | null
  url: string | null
  tone: BadgeTone
  linksToData: boolean
}>()
</script>
