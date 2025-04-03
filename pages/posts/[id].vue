<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    v-if="post"
    class="container mb-24"
  >
    <div class="flex items-center">
      <Breadcrumb class="flex-1">
        <li>
          <NuxtLinkLocale
            class="fr-breadcrumb__link"
            :external="true"
            to="/"
          >
            {{ $t('Home') }}
          </NuxtLinkLocale>
        </li>
        <li>
          <NuxtLinkLocale
            class="fr-breadcrumb__link"
            to="/posts"
          >
            {{ $t('Posts') }}
          </NuxtLinkLocale>
        </li>
        <li>
          <a
            class="fr-breadcrumb__link"
            aria-current="page"
          >
            {{ post.name }}
          </a>
        </li>
      </Breadcrumb>
      <div v-if="isAdmin(me)">
        <EditButton
          :id="post.id"
          type="posts"
        />
      </div>
    </div>
    <h1 class="!text-4.5xl !font-extrabold !mb-0">
      {{ post.name }}
    </h1>
    <template v-if="post.published || isAdmin(me)">
      <p
        v-if="post.published"
        class="text-xs mb-0"
      >
        {{ $t('Published the {date}', { date: formatDate(post.published) }) }}
      </p>
      <p
        v-else
        class="text-xs mb-0"
      >
        {{ $t('Not published yet') }}
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
      />
      <div
        v-else
        :class="markdownClasses"
        v-html="post.content"
      />

      <DiscussionsList
        class="mt-16"
        :subject="{
          class: 'Post',
          id: post.id,
        }"
      />
    </template>
    <template v-else>
      {{ $t('This post is not published yet !') }}
    </template>
  </div>
</template>

<script setup lang="ts">
import EditButton from '~/components/BrandedButton/EditButton.vue'
import type { Post } from '~/types/posts'

const route = useRoute()
const me = useMaybeMe()
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
