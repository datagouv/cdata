<!-- eslint-disable vue/no-v-html -->
<template>
  <div v-if="post">
    <!-- Full page blocs mode: no header, no breadcrumb, just the blocs -->
    <PageShowById
      v-if="isFullPageBlocs && pageId"
      :page-id="pageId"
    />

    <!-- Standard news mode -->
    <div
      v-else
      class="container mb-24"
    >
      <div class="flex items-center">
        <Breadcrumb class="flex-1">
          <BreadcrumbItem
            to="/"
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
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4.5xl font-extrabold text-gray-title mb-0">
          {{ post.name }}
        </h1>
        <template v-if="post.published || isMeAdmin()">
          <p
            v-if="post.published"
            class="text-xs mt-2 mb-0"
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
            class="w-full h-auto mb-2"
          >
          <template v-if="post.body_type === 'blocs' && pageId">
            <PageShowById :page-id="pageId" />
          </template>
          <template v-else-if="post.body_type === 'markdown'">
            <MarkdownViewer
              :content="post.content"
              :min-heading="2"
              size="md"
            />
          </template>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { markdownClasses, MarkdownViewer, useFormatDate } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import PageShowById from '~/components/Pages/PageShowById.vue'
import type { Post } from '~/types/posts'

const config = useRuntimeConfig()
const route = useRoute()
const { formatDate } = useFormatDate()

const url = computed(() => `/api/1/posts/${route.params.id}/`)
const { data: post } = await useAPI<Post>(url, { redirectOn404: true })

const name = computed(() => post.value?.name)
const robots = computed(() => !post.value?.published ? 'noindex, nofollow' : 'all')

const pageId = computed(() => {
  if (!post.value?.content_as_page) return null
  return typeof post.value.content_as_page === 'string'
    ? post.value.content_as_page
    : post.value.content_as_page.id
})

const isFullPageBlocs = computed(() => post.value?.kind === 'page' && post.value?.body_type === 'blocs')

useSeoMeta({
  title: name,
  robots: robots,
})
useHead({
  script: [
    {
      'data-udata': config.public.frontBase,
      'src': '/oembed.js',
      'tagPosition': 'bodyClose',
    },
  ],
})
</script>
