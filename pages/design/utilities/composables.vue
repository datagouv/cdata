<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Composables
      </h1>
      <p class="mt-2 text-gray-600">
        Fonctions utilitaires réutilisables pour Vue 3.
      </p>
    </div>

    <DesignDocSection
      title="useFormatDate"
      description="Fonctions pour formater les dates."
      :in-lib="true"
    >
      <template #code>
        <CodeExample :code="useFormatDateCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="useMetrics"
      description="Fonctions pour formater les métriques (nombres, tailles, etc.)."
      :in-lib="true"
    >
      <template #code>
        <CodeExample :code="useMetricsCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="getLink"
      description="Génère des liens vers les objets data.gouv.fr."
      :in-lib="true"
    >
      <template #code>
        <CodeExample :code="getLinkCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="summarize"
      description="Tronque un texte avec ellipse."
      :in-lib="true"
    >
      <template #code>
        <CodeExample :code="summarizeCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="toast"
      description="Affiche des notifications toast."
      :in-lib="true"
    >
      <template #code>
        <CodeExample :code="toastCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="useAPI"
      description="Wrapper pour les appels API avec gestion d'erreurs."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="useAPICode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import CodeExample from '~/design-system/CodeExample.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'

const useFormatDateCode = `
<script setup>
import { useFormatDate } from '@datagouv/components-next'

const { formatDate, formatFromNow, formatRelativeIfRecentDate } = useFormatDate()

// Formatage standard
const date = formatDate('2024-01-15')
// => "15 janvier 2024"

// Temps relatif
const relative = formatFromNow('2024-01-15')
// => "il y a 2 mois"

// Relatif si récent, sinon date complète
const smart = formatRelativeIfRecentDate('2024-01-15')
<\/script>
`

const useMetricsCode = `
<script setup>
import { useMetrics } from '@datagouv/components-next'

const { formatNumber, formatBytes } = useMetrics()

// Formatage des nombres
const views = formatNumber(1234567)
// => "1 234 567" ou "1.2M" selon le format

// Formatage des tailles de fichier
const size = formatBytes(1048576)
// => "1 Mo"
<\/script>
`

const getLinkCode = `
<script setup>
import { getLink } from '@datagouv/components-next'

// Génère le lien vers un dataset
const datasetUrl = getLink.dataset(dataset)
// => "/datasets/mon-dataset-slug"

// Génère le lien vers une organisation
const orgUrl = getLink.organization(organization)
// => "/organizations/mon-org-slug"

// Génère le lien vers une réutilisation
const reuseUrl = getLink.reuse(reuse)
// => "/reuses/ma-reuse-slug"
<\/script>
`

const summarizeCode = `
<script setup>
import { summarize } from '@datagouv/components-next'

const longText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
const short = summarize(longText, 100)
// => "Lorem ipsum dolor sit amet, consectetur adipiscing..."
<\/script>
`

const toastCode = `
<script setup>
import { toast } from '@datagouv/components-next'

// Toast de succès
toast.success('Opération réussie !')

// Toast d'erreur
toast.error('Une erreur est survenue')

// Toast d'information
toast.info('Information importante')

// Toast d'avertissement
toast.warning('Attention !')
<\/script>
`

const useAPICode = `
<script setup>
// Composable local pour les appels API
const { data, status, error, refresh } = await useAPI('/api/datasets', {
  query: { page: 1, page_size: 20 }
})

// Gère automatiquement:
// - L'authentification
// - Les erreurs HTTP
// - Le retry en cas d'échec
// - Le cache
<\/script>
`
</script>
