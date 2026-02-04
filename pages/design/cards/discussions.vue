<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Discussion Cards
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour afficher les discussions et commentaires.
      </p>
    </div>

    <DesignDocSection
      title="DiscussionMessageCard"
      description="Carte compacte pour afficher une discussion dans une liste."
      :in-lib="true"
    >
      <template #props>
        <PropsTable :props="discussionMessageCardProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <div class="grid gap-4 md:grid-cols-2">
            <LoadingBlock
              v-for="thread in discussions"
              :key="thread.id"
              :status="discussionsStatus"
              :data="thread"
            >
              <template #default="{ data }">
                <DiscussionMessageCard
                  :discussion="{
                    ...data,
                    user: data.discussion[0]?.posted_by,
                  }"
                />
              </template>
            </LoadingBlock>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="discussionMessageCardCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="DiscussionCard"
      description="Carte complète pour afficher une discussion avec tous ses messages."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="discussionCardCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="CommentBlock"
      description="Bloc pour afficher un commentaire individuel."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="commentBlockCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="ThreadHeader"
      description="En-tête d'un fil de discussion."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="threadHeaderCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { DiscussionMessageCard, LoadingBlock } from '@datagouv/components-next'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const { discussions, discussionsStatus } = useDesignData()

const discussionMessageCardProps: PropDefinition[] = [
  { name: 'discussion', type: 'Thread & { user: User }', required: true, description: 'Objet discussion à afficher' },
]

const discussionMessageCardCode = `
<template>
  <DiscussionMessageCard :discussion="discussion" />
</template>

<script setup>
import { DiscussionMessageCard } from '@datagouv/components-next'

const { data: discussions } = await useAPI('/api/1/discussions/')
<\/script>
`

const discussionCardCode = `
<template>
  <DiscussionCard :thread="thread" subject-type="dataset" />
</template>

<script setup>
import DiscussionCard from '~/components/Discussions/DiscussionCard.vue'
<\/script>
`

const commentBlockCode = `
<template>
  <CommentBlock :comment="comment" />
</template>

<script setup>
import CommentBlock from '~/components/Discussions/CommentBlock.vue'
<\/script>
`

const threadHeaderCode = `
<template>
  <ThreadHeader :thread="thread" subject-type="dataset" />
</template>

<script setup>
import ThreadHeader from '~/components/Discussions/ThreadHeader.vue'
<\/script>
`
</script>
