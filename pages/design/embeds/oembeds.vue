<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        OEmbeds
      </h1>
      <p class="mt-2 text-gray-600">
        Intégrations oEmbed pour l'affichage d'objets data.gouv.fr dans des contextes externes.
        Ces intégrations permettent d'embarquer des previews dans d'autres sites.
      </p>
    </div>

    <DesignDocSection
      title="Dataset oEmbed"
      description="Intégration oEmbed pour afficher un dataset."
      :in-lib="true"
    >
      <template #code>
        <CodeExample :code="datasetOembedCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="Organization oEmbed"
      description="Intégration oEmbed pour afficher une organisation."
      :in-lib="true"
    >
      <template #code>
        <CodeExample :code="organizationOembedCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="Comment utiliser oEmbed"
      description="Guide pour intégrer les embeds dans vos pages."
      :in-lib="true"
    >
      <div class="prose max-w-none">
        <h4>Endpoint oEmbed</h4>
        <p>L'API oEmbed est disponible à l'URL suivante:</p>
        <CodeExample :code="oembedEndpoint" />

        <h4>Paramètres</h4>
        <ul>
          <li>
            <code>url</code>: L'URL de la ressource data.gouv.fr
          </li>
          <li>
            <code>format</code>: Format de réponse (json ou xml)
          </li>
        </ul>

        <h4>Exemple de réponse</h4>
        <CodeExample :code="oembedResponse" />
      </div>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import CodeExample from '~/design-system/CodeExample.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'

const datasetOembedCode = `
<template>
  <div v-html="getDatasetOEmbedHtml(dataset, datasetUrl)" />
</template>

<script setup>
import { getDatasetOEmbedHtml } from '@datagouv/components-next'

const datasetUrl = \`/datasets/\${dataset.slug}\`
<\/script>
`

const organizationOembedCode = `
<template>
  <div v-html="getOrganizationOEmbedHtml(organization, organizationUrl)" />
</template>

<script setup>
import { getOrganizationOEmbedHtml } from '@datagouv/components-next'
<\/script>
`

const oembedEndpoint = `
GET https://www.data.gouv.fr/api/1/oembed/?url={url}&format=json
`

const oembedResponse = `
{
  "type": "rich",
  "version": "1.0",
  "title": "Nom du dataset",
  "html": "<div class='datagouv-embed'>...</div>",
  "width": 400,
  "height": 200
}
`
</script>
