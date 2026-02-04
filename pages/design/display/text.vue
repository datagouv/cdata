<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Texte
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour l'affichage et le formatage de texte.
      </p>
    </div>

    <DesignDocSection
      title="MarkdownViewer"
      description="Affiche du contenu Markdown formaté."
      :in-lib="true"
    >
      <template #preview>
        <ComponentPreview>
          <MarkdownViewer :content="sampleMarkdown" />
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="markdownViewerCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="ReadMore"
      description="Tronque le texte avec un bouton 'Lire la suite'."
      :in-lib="true"
    >
      <template #preview>
        <ComponentPreview>
          <ReadMore>
            <div class="prose">
              {{ longText }}
            </div>
          </ReadMore>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="readMoreCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="TextClamp"
      description="Limite le nombre de lignes affichées avec ellipsis."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="textClampCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { MarkdownViewer, ReadMore } from '@datagouv/components-next'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'

const sampleMarkdown = `
## Titre de section

Voici un paragraphe avec du **texte en gras** et du *texte en italique*.

- Premier élément
- Deuxième élément
- Troisième élément

\`\`\`javascript
const hello = 'world';
\`\`\`
`

const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`

const markdownViewerCode = `
<template>
  <MarkdownViewer :source="markdownContent" />
</template>

<script setup>
import { MarkdownViewer } from '@datagouv/components-next'
<\/script>
`

const readMoreCode = `
<template>
  <ReadMore>
    <div class="prose">
      {{ longDescription }}
    </div>
  </ReadMore>
</template>

<script setup>
import { ReadMore } from '@datagouv/components-next'
<\/script>
`

const textClampCode = `
<template>
  <TextClamp :max-lines="3">
    {{ longText }}
  </TextClamp>
</template>

<script setup>
import TextClamp from '~/components/TextClamp.client.vue'
<\/script>
`
</script>
