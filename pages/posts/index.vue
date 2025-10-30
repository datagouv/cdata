<template>
  <div>
    <div class="container">
      <Breadcrumb>
        <BreadcrumbItem
          to="/"
        >
          {{ $t('Accueil') }}
        </BreadcrumbItem>
        <BreadcrumbItem>
          {{ $t('Articles') }}
        </BreadcrumbItem>
      </Breadcrumb>
    </div>
    <div class="border-b border-gray-lowest">
      <div class="container">
        <h1 class="text-4.5xl font-extrabold text-gray-title pt-10 pb-[3.75rem] !mb-0">
          {{ $t('Articles') }}
        </h1>
      </div>
    </div>
    <div
      v-if="posts"
      class="container mt-16 space-y-16 mb-16"
    >
      <div class="grid md:grid-cols-6 gap-5">
        <PostCard
          v-for="(post, index) in posts.data"
          :key="post.id"
          :post
          :class="index < 2 ? 'col-span-3' : 'col-span-2'"
        />
      </div>
      <Pagination
        :link="getLink"
        :page="posts.page"
        :page-size="posts.page_size"
        :total-results="posts.total"
        @change="(changedPage: number) => page = changedPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pagination, getLink } from '@datagouv/components-next'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import type { Post } from '~/types/posts'
import type { PaginatedArray } from '~/types/types'

const { t } = useTranslation()

useSeoMeta({
  title: t('Articles'),
})
const route = useRoute()
const page = ref(route.query.page ?? 1)

watch(page, async () => {
  await navigateTo({
    ...route,
    query: {
      ...route.query,
      page: page.value,
    },
  })
  document.children[0].scrollIntoView({ behavior: 'smooth', block: 'start' })
})

const { data: posts } = await useAPI<PaginatedArray<Post>>('api/1/posts/', { params:
  {
    page,
    page_size: 14,
    sort: '-published',
  },
})
</script>
