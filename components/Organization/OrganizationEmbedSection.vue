<template>
  <SectionCollapse
    :title="$t('Intégrer sur votre site')"
    :button-text="$t('Voir les oembeds')"
  >
    <div class="grid min-w-0 gap-6">
      <article
        v-for="embed in organizationEmbeds"
        :key="embed.type"
        class="grid min-w-0 gap-3"
      >
        <h3 class="m-0 text-sm/5 font-medium text-gray-title">
          {{ $t(embed.title) }}
        </h3>
        <CodeBlock
          :code="getOrganizationOEmbedHtml(embed.type, organization.id)"
          language="HTML"
          :label="$t(`Copier l'intégration`)"
          :copied-label="$t('Intégration copiée !')"
        />
      </article>
    </div>
  </SectionCollapse>
</template>

<script setup lang="ts">
import { CodeBlock, getOrganizationOEmbedHtml, type Organization } from '@datagouv/components-next'
import SectionCollapse from '~/components/SectionCollapse.vue'

// Section of the Informations tab of an organization. Also shown on /design/metadata: the design
// page and the organization pages render this same component, so they cannot drift apart.
defineProps<{
  organization: Organization
}>()

const organizationEmbeds = [
  { type: 'search-dataset', title: 'La recherche de jeux de données de l’organisation' },
  { type: 'search-dataservice', title: 'La recherche des API de l’organisation' },
  { type: 'list-reuse', title: 'La liste des réutilisations de l’organisation' },
] as const
</script>
