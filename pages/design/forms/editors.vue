<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Éditeurs
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour l'édition de contenu riche.
      </p>
    </div>

    <DesignDocSection
      title="MarkdownEditor"
      description="Éditeur Markdown avec prévisualisation."
      :in-lib="false"
    >
      <template #props>
        <PropsTable :props="markdownEditorProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <MarkdownEditor
            id="demo-editor"
            :value="editorContent"
            aria-label="Éditeur de démonstration"
            @change="editorContent = $event"
          />
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="markdownEditorCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="MarkdownViewer"
      description="Affichage de contenu Markdown formaté."
      :in-lib="true"
    >
      <template #preview>
        <ComponentPreview>
          <MarkdownViewer :content="markdownContent" />
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="markdownViewerCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { MarkdownViewer } from '@datagouv/components-next'
import MarkdownEditor from '~/components/MarkdownEditor/MarkdownEditor.vue'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const editorContent = ref('# Titre\n\nÉcrivez du **Markdown** ici.')

const markdownContent = `# Titre

Paragraphe avec **gras** et *italique*.

- Liste item 1
- Liste item 2

\`\`\`javascript
const hello = 'world'
\`\`\`
`

const markdownEditorProps: PropDefinition[] = [
  { name: 'id', type: 'string', required: true, description: 'ID unique de l\'éditeur' },
  { name: 'value', type: 'string', description: 'Contenu Markdown' },
  { name: 'ariaLabel', type: 'string', description: 'Label pour l\'accessibilité' },
  { name: 'ariaLabelledBy', type: 'string', description: 'ID de l\'élément servant de label' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Désactive l\'éditeur' },
]

const markdownEditorCode = `
<template>
  <MarkdownEditor
    id="my-editor"
    :value="content"
    aria-label="Description"
    @change="content = $event"
  />
</template>

<script setup>
import MarkdownEditor from '~/components/MarkdownEditor/MarkdownEditor.vue'

const content = ref('')
<\/script>
`

const markdownViewerCode = `
<template>
  <MarkdownViewer :content="markdownContent" />
</template>

<script setup>
import { MarkdownViewer } from '@datagouv/components-next'

const markdownContent = \`
# Titre

Paragraphe avec **gras** et *italique*.

- Liste item 1
- Liste item 2
\`
<\/script>
`
</script>
