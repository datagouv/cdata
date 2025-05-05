<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem :to="`/admin/site/posts`">
        {{ t('Posts') }}
      </BreadcrumbItem>
      <BreadcrumbItem v-if="post">
        {{ post.name }}
      </BreadcrumbItem>
    </AdminBreadcrumb>

    <div v-if="post">
      <div class="flex flex-wrap items-center justify-between mb-5 gap-x-4 gap-y-2">
        <h1 class="flex-none w-full md:flex-1 font-bold text-2xl !mb-0">
          {{ post.name }}
        </h1>
        <BrandedButton
          :href="post.page"
          :icon="RiEyeLine"
          size="xs"
          color="secondary"
        >
          {{ t('See the post page') }}
        </BrandedButton>
      </div>

      <TabLinks
        class="mb-5"
        :links="[
          { href: `/admin/posts/${post.id}`, label: t('Metadata') },
          { href: `/admin/posts/${post.id}/content`, label: t('Content') },
        ]"
      />

      <NuxtPage :page-key="route => route.fullPath" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { RiEyeLine } from '@remixicon/vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import TabLinks from '~/components/TabLinks.vue'
import type { Post } from '~/types/posts'

const { t } = useI18n()

const route = useRoute()
const url = computed(() => `/api/1/posts/${route.params.id}`)
const { data: post } = await useAPI<Post>(url, { lazy: true })
</script>
