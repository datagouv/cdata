<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Topic Cards
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour afficher les bouquets thématiques.
      </p>
    </div>

    <DesignDocSection
      title="TopicCard"
      description="Carte pour afficher un bouquet thématique."
      :in-lib="true"
    >
      <template #props>
        <PropsTable :props="topicCardProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <div class="grid gap-4 md:grid-cols-2">
            <LoadingBlock
              v-for="topic in topics"
              :key="topic.id"
              :status="topicsStatus"
              :data="topic"
            >
              <template #default="{ data }">
                <TopicCard :topic="data" />
              </template>
            </LoadingBlock>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="topicCardCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { LoadingBlock, TopicCard } from '@datagouv/components-next'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const { topics, topicsStatus } = useDesignData()

const topicCardProps: PropDefinition[] = [
  { name: 'topic', type: 'TopicV2', required: true, description: 'Objet topic à afficher' },
]

const topicCardCode = `
<template>
  <TopicCard :topic="topic" />
</template>

<script setup>
import { TopicCard } from '@datagouv/components-next'

const { data: topics } = await useAPI('/api/2/topics/')
<\/script>
`
</script>
