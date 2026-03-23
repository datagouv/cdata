<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/cards">
        {{ $t('Cards') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Cards
    </h1>

    <h2 class="mb-3">
      Dataset
    </h2>
    <div class="not-prose grid gap-4 md:grid-cols-2">
      <EmbedsDatasetCard slug="municipales-2020-resultats-2nd-tour" />
      <EmbedsDatasetCard slug="elections-municipales-2020-liste-des-candidats-elus-au-t1-et-liste-des-communes-entierement-pourvues" />
    </div>

    <h2 class="mb-3">
      Dataservice
    </h2>
    <div class="not-prose grid gap-4 md:grid-cols-2">
      <EmbedsDataserviceCard slug="api-tabulaire-data-gouv-fr-beta" />
      <EmbedsDataserviceCard slug="api-sirene-open-data" />
    </div>

    <h2 class="mb-3">
      Reuse (vertical)
    </h2>
    <div class="my-4 not-prose grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <EmbedsReuseCard
        class="flex-1"
        slug="datafrance-plateforme-de-visualisation-open-data"
      />
      <EmbedsReuseCard
        class="flex-1"
        slug="lannuaire-des-entreprises"
      />
      <EmbedsReuseCard
        class="flex-1"
        slug="geozones"
      />
    </div>

    <h2 class="mb-3">
      Reuse (horizontal)
    </h2>
    <div class="not-prose grid gap-4 md:grid-cols-2">
      <LoadingBlock
        v-for="reuse in reusesForHorizontal"
        :key="reuse.id"
        v-slot="{ data }"
        :status="reusesHorizontalStatus"
        :data="reuse"
        class="bg-transparent"
      >
        <ReuseHorizontalCard
          v-if="data"
          :reuse="data"
        />
      </LoadingBlock>
    </div>

    <h2 class="mb-3">
      Organization
    </h2>
    <div class="my-4 not-prose grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <EmbedsOrganizationCard
        class="flex-1"
        slug="sante-publique-france"
      />
      <EmbedsOrganizationCard
        class="flex-1"
        slug="autorite-de-regulation-des-communications-electroniques-des-postes-et-de-la-distribution-de-la-presse-arcep"
      />
      <EmbedsOrganizationCard
        class="flex-1"
        slug="sncf"
      />
    </div>

    <h2 class="mb-3">
      Discussion
    </h2>
    <div class="not-prose grid gap-4 md:grid-cols-2">
      <LoadingBlock
        v-for="discussion in discussionsForCards"
        :key="discussion.id"
        v-slot="{ data }"
        :status="discussionStatus"
        :data="discussion"
        class="bg-transparent"
      >
        <DiscussionMessageCard
          v-if="data"
          :discussion="data"
        />
      </LoadingBlock>
    </div>

    <h2 class="mb-3">
      Post
    </h2>
    <div class="not-prose grid gap-4 md:grid-cols-2">
      <LoadingBlock
        v-for="post in posts"
        :key="post.id"
        v-slot="{ data }"
        :status="postStatus"
        :data="post"
        class="bg-transparent"
      >
        <PostCard
          v-if="data"
          :post="data"
        />
      </LoadingBlock>
    </div>

    <h2 class="mb-3">
      Topic
    </h2>
    <div class="not-prose grid gap-4 md:grid-cols-2">
      <LoadingBlock
        v-for="topic in topics"
        :key="topic.id"
        v-slot="{ data }"
        :status="topicStatus"
        :data="topic"
        class="bg-transparent"
      >
        <TopicCard
          v-if="data"
          :topic="data"
        />
      </LoadingBlock>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DiscussionMessageCard, LoadingBlock, PostCard, ReuseHorizontalCard, TopicCard, type PaginatedArray, type Post, type Reuse, type Thread, type TopicV2 } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const { data: reusesData, status: reusesHorizontalStatus } = await useAPI<PaginatedArray<Reuse>>('/api/1/reuses/', { lazy: true, server: false, query: { page_size: 2 } })
const reusesForHorizontal = computed(() => reusesData.value?.data ?? [])

const { data: discussionsData, status: discussionStatus } = await useAPI<PaginatedArray<Thread>>('/api/1/discussions/', { lazy: true, server: false, query: { page_size: 2 } })
const discussionsForCards = computed(() => {
  if (!discussionsData.value?.data) return []
  return discussionsData.value.data.map(thread => ({
    ...thread,
    user: thread.discussion[0]?.posted_by,
  }))
})

const { data: postsData, status: postStatus } = await useAPI<PaginatedArray<Post>>('/api/1/posts/', { lazy: true, server: false, query: { page_size: 2 } })
const posts = computed(() => postsData.value?.data ?? [])

const { data: topicsData, status: topicStatus } = await useAPI<PaginatedArray<TopicV2>>('/api/2/topics/', { lazy: true, server: false, query: { page_size: 2 } })
const topics = computed(() => topicsData.value?.data ?? [])
</script>
