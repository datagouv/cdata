<template>
  <div>
    <div class="bg-primary py-16">
      <div class="container space-y-5">
        <div class="space-y-2">
          <div class="flex flex-col-reverse sm:flex-row gap-5 sm:items-center sm:justify-between">
            <h1 class="text-white font-extrabold text-5xl mb-0">
              {{ $t('Jeux de données') }}
            </h1>
            <CdataLink class="bg-[#0D0C4F]/20 text-white font-medium text-lg px-5 py-3 rounded-4xl flex items-center gap-2">
              <RiInformation2Line class="size-6" />
              <span>{{ $t(`Qu'est-ce qu'un jeu de données ?`) }}</span>
            </CdataLink>
          </div>
          <div class="italic font-spectral text-2xl text-white">
            {{ $t('Rechercher parmi les {count} jeux de données sur {site}', {
              count: site.metrics.datasets,
              site: config.public.title,
            }) }}
          </div>
        </div>
        <form
          method="GET"
          action="/datasets/search"
          class="w-full flex rounded-t overflow-hidden"
        >
          <input
            name="q"
            class="w-full text-2xl bg-white/80 border-b-4 border-white px-4 text-black placeholder:text-gray-plain"
            :placeholder="$t('ex. élections présidentielles')"
          >
          <button class="shrink-0 size-20 bg-white flex items-center justify-center">
            <RiSearchLine class="size-10 text-primary" />
          </button>
        </form>
      </div>
    </div>
    <PageShow
      v-if="page"
      :page
    />
    <div class="bg-primary py-16">
      <div class="mx-auto max-w-xl flex flex-col items-center">
        <p class="text-white font-extrabold text-center text-4xl">
          {{ $t(`Vous n'avez pas trouvé ce que vous cherchez ?`) }}
        </p>
        <BrandedButton
          color="secondary"
          size="lg"
          href="/datasets/search"
        >
          {{ $t('Voir tous les jeux de données') }}
        </BrandedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, type Site } from '@datagouv/components-next'
import { RiInformation2Line, RiSearchLine } from '@remixicon/vue'
import PageShow from '~/components/Pages/PageShow.vue'
import type { Page } from '~/types/pages'

const { t } = useI18n()
useSeoMeta({
  title: t('Jeux de données'),
})

const config = useRuntimeConfig()

const { data: site } = await useAPI<Site>('/api/1/site')
const { data: page } = await useAPI<Page>(`/api/1/pages/${site.value.datasets_page_id}`)
</script>
