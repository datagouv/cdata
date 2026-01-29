<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Post Cards
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour afficher les articles de blog.
      </p>
    </div>

    <DesignDocSection
      title="PostCard"
      description="Carte pour afficher un article de blog."
      :in-lib="true"
    >
      <template #props>
        <PropsTable :props="postCardProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <div class="grid gap-4 md:grid-cols-2">
            <LoadingBlock
              v-for="post in posts"
              :key="post.id"
              :status="postsStatus"
              :data="post"
            >
              <template #default="{ data }">
                <PostCard :post="data" />
              </template>
            </LoadingBlock>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="postCardCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { LoadingBlock, PostCard } from '@datagouv/components-next'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const { posts, postsStatus } = useDesignData()

const postCardProps: PropDefinition[] = [
  { name: 'post', type: 'Post', required: true, description: 'Objet post à afficher' },
]

const postCardCode = `
<template>
  <PostCard :post="post" />
</template>

<script setup>
import { PostCard } from '@datagouv/components-next'

const { data: posts } = await useAPI('/api/1/posts/')
<\/script>
`
</script>
