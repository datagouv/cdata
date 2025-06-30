<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    v-if="post"
    class="container mb-24"
  >
    <div class="flex items-center">
      <Breadcrumb class="flex-1">
        <BreadcrumbItem
          to="/"
          external
        >
          {{ $t('Accueil') }}
        </BreadcrumbItem>
        <BreadcrumbItem to="/posts">
          {{ $t('Articles') }}
        </BreadcrumbItem>
        <BreadcrumbItem v-if="post">
          {{ post.name }}
        </BreadcrumbItem>
      </Breadcrumb>

      <div v-if="isMeAdmin()">
        <EditButton
          :id="post.id"
          type="posts"
        />
      </div>
    </div>
    <h1 class="!text-4.5xl !font-extrabold !mb-0">
      {{ post.name }}
    </h1>
    <template v-if="post.published || isMeAdmin()">
      <p
        v-if="post.published"
        class="text-xs mb-0"
      >
        {{ $t('Publié le {date}', { date: formatDate(post.published) }) }}
      </p>
      <p
        v-else
        class="text-xs mb-0"
      >
        {{ $t('Pas encore publié') }}
      </p>
      <p class="mt-4 mb-6">
        {{ post.headline }}
      </p>
      <img
        v-if="post.image"
        :src="post.image"
        class="w-full h-auto"
      >
      <MarkdownViewer
        v-if="post.body_type === 'markdown'"
        :content="post.content"
        :min-heading="2"
        size="md"
      />
      <div
        v-else
        :class="markdownClasses"
        v-html="post.content"
      />

      <DiscussionsList
        v-if="config.public.allowDiscussionsInPosts"
        class="mt-16"
        type="Post"
        :subject="post"
      />
    </template>
    <template v-else>
      {{ $t(`Cet article n'est pas encore publié`) }}
    </template>
  </div>
</template>

<script setup lang="ts">
import { useFormatDate } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import type { Post } from '~/types/posts'

const config = useRuntimeConfig()
const route = useRoute()
const { formatDate } = useFormatDate()

const url = computed(() => `/api/1/posts/${route.params.id}/`)
const { data: post } = await useAPI<Post>(url)

const name = computed(() => post.value?.name)
const robots = computed(() => !post.value?.published ? 'noindex, nofollow' : 'all')

useSeoMeta({
  title: name,
  robots: robots,
})
useHead({
  script: [
    {
      'data-udata': 'https://www.data.gouv.fr/',
      'src': 'https://static.data.gouv.fr/static/oembed.js',
      'body': true,
    },
  ],
})
</script>
