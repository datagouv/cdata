<template>
  <div>
    <section class="py-8 sm:py-[200px] bg-[url(''),radial-gradient(rgba(255,255,255,0.8),rgba(217,217,217,0)),url('/nuxt_images/homepage/hero.png')] bg-center">
      <div class="max-w-[800px] mx-auto flex flex-col items-center space-y-8">
        <div class="flex flex-col sm:flex-row gap-5 items-center">
          <NuxtLinkLocale
            v-if="lastPost"
            class="max-w-[340px] inline-flex items-center fr-raw-link text-sm/loose px-3 text-primary border  border-primary rounded-lg bg-white text-overflow-ellipsis"
            :to="`/posts/${lastPost.slug}`"
          >
            <span
              aria-hidden="true"
              class="fr-icon-newspaper-line fr-icon--sm fr-mr-1w"
            />
            <span class="fr-text--bold fr-mb-0">{{ $t('Actualités') }}</span>
            <span class="text-overflow-ellipsis">&nbsp;: {{ lastPost.name }}</span>
          </NuxtLinkLocale>
          <NuxtLinkLocale
            v-if="config.public.homepageRightNow"
            class="max-w-[340px] inline-flex items-center fr-raw-link text-sm/loose px-3 text-primary border  border-primary rounded-lg bg-white text-overflow-ellipsis"
            :to="config.public.homepageRightNow.url"
          >
            <span
              aria-hidden="true"
              class="fr-icon-notification-3-line fr-icon--sm fr-mr-1w"
            />
            <span class="fr-text--bold fr-mb-0">{{ $t('En ce moment') }}</span>
            <span class="text-overflow-ellipsis">&nbsp;: {{ config.public.homepageRightNow.title }}</span>
          </NuxtLinkLocale>
        </div>
        <div class="space-y-4">
          <h1 class="text-6xl font-extrabold text-primary text-center">
            {{ $t('La plateforme des données publiques françaises') }}
          </h1>
          <p class="fr-text--alt f-italic fr-h4 fr-mb-4w fr-text--regular m-0 text-primary text-align-center">
            {{ $t('Utilisez, partagez et améliorez les données publiques') }}
          </p>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-2.5">
          <BrandedButton href="/datasets">
            {{ $t('Découvrez les jeux de données') }}
          </BrandedButton>
          <BrandedButton
            href="/reuses"
            color="primary-soft"
          >
            {{ $t('Explorez les réutilisations de données') }}
          </BrandedButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import type { Post } from '~/types/posts'
import type { PaginatedArray } from '~/types/types'

const config = useRuntimeConfig()

const { data: posts } = await useAPI<PaginatedArray<Post>>('/api/1/posts')

const lastPost = computed(() => {
  if (!posts.value || !posts.value.data.length) return null
  return posts.value.data[0]
})
</script>
