<template>
  <div>
    <EditoHeader
      color="purple"
      :title="$t('APIs')"
      :subtitle="$t('Rechercher parmi les {count} APIs sur {site}', {
        count: site.metrics.dataservices,
        site: config.public.title,
      })"
      :placeholder="$t('ex: SIRENE')"
      search-url="/dataservices/search"
      :link-label="$t(`Qu'est-ce qu'une API ?`)"
      :link-url="config.public.guideDataservices"
    />
    <PageShowById
      v-if="site.dataservices_page"
      :page-id="site.dataservices_page"
      main-color="brown-illustration"
    />
    <div class="container flex flex-col sm:flex-row items-center  gap-2 py-16">
      <div class="w-full">
        <div class="max-w-md">
          <div class="font-extrabold text-3xl">
            {{ $t('Administrations, ') }}
          </div>
          <div class="text-3xl">
            {{ $t('simplifiez les démarches administratives grâce aux API') }}
          </div>
          <div class="mt-2">
            {{ $t('Des exemples d’outils et de l′accompagnement à votre disposition pour simplifier, avec de la donnée, les démarches des citoyens.') }}
          </div>
        </div>
      </div>
      <div class="w-full grid grid-cols-2 gap-4">
        <div class="bg-gray-lowest-2 flex flex-col items-center p-8 space-y-4">
          <nuxt-img
            src="/illustrations/book-2.svg"
            class="h-20"
          />

          <div class="font-extrabold text-center">
            {{ $t('La doctrine des API') }}
          </div>
          <div class="text-sm text-center">
            {{ $t('Elle précise le cadre d’action et identifie les bonnes pratiques à poursuivre en matière d’usage et d’exposition d’API par les administrations') }}
          </div>
           <BrandedButton
            href="https://guides.data.gouv.fr/guide-data.gouv.fr/api/outils-pour-les-administrations/doctrine-des-api"
            target="_blank"
            rel="noopener noreferrer"
            color="brown-illustration"
            :icon="RiArrowRightLine"
            :icon-right="true"
            size="sm"
            aria-label="Doctrine des API sur guides.data.gouv.fr"
          >
           Lire la doctrine
          </BrandedButton>
        </div>
        <div class="bg-gray-lowest-2 flex flex-col items-center p-8 space-y-4">
          <nuxt-img
            src="/illustrations/newspapper.svg"
            class="h-20"
          />

          <div class="font-extrabold text-center">
            {{ $t('Datapass') }}
          </div>
          <div class="text-sm text-center">
            {{ $t(`Datapass vous permet de demander et gérer vos habilitations à différentes données en accès restreint.`) }}
          </div>
           <BrandedButton
            href="https://guides.data.gouv.fr/guide-data.gouv.fr/api/outils-pour-les-administrations/datapass-outil-dhabilitations"
            target="_blank"
            rel="noopener noreferrer"
            color="secondary"
            :icon="RiArrowRightLine"
            :icon-right="true"
            size="sm"
            aria-label="DataPass sur guides.data.gouv.fr"
          >
           En savoir plus
          </BrandedButton>
        </div>
        <div class="bg-gray-lowest-2 flex flex-col items-center p-8 space-y-4">
          <nuxt-img
            src="/illustrations/lightbulb.svg"
            class="h-20"
          />

          <div class="font-extrabold text-center">
            {{ $t('Le portail Simplifions.data.gouv') }}
          </div>
          <div class="text-sm text-center">
            {{ $t(`Des cas d'usages et des solutions pour simplifier les démarches des citoyens, entreprises et associations, grâce aux API et aux données.`) }}
          </div>
          <BrandedButton
            href="https://simplifions.data.gouv.fr/"
            target="_blank"
            rel="noopener noreferrer"
            color="brown-illustration"
            :icon="RiExternalLinkFill"
            :icon-right="true"
            size="sm"
            aria-label="Aller sur Simplifions.data — lien externe"
          >
           Consulter le site 
          </BrandedButton>
        </div>
        <div class="bg-gray-lowest-2 flex flex-col items-center p-8 space-y-4">
          <nuxt-img
            src="/illustrations/show.svg"
            class="h-20"
          />

          <div class="font-extrabold text-center">
            {{ $t('Un accompagnement humain') }}
          </div>
          <div class="text-sm text-center">
            {{ $t(`N’hésitez pas à contacter le pôle circulation de la donnée de la DINUM, qui est disponible pour vous aider pour toutes vos questions relatives aux APIs. `) }}
          </div>
                    <BrandedButton
            href="https://guides.data.gouv.fr/guide-data.gouv.fr/api/outils-pour-les-administrations/accompagnement-humain"
            target="_blank"
            rel="noopener noreferrer"
            color="secondary"
            :icon="RiExternalLinkFill"
            :icon-right="true"
            size="sm"
            aria-label="Accompagnement humain sur guides.data.gouv.fr"
          >
           En savoir plus
          </BrandedButton>
        </div>
      </div>
    </div>
    <EditoFooter
      color="purple"
      search-url="/dataservices/search"
      :search-label="$t(`Voir toutes les APIs`)"
    />
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, type Site } from '@datagouv/components-next'
import { RiExternalLinkFill, RiArrowRightLine } from '@remixicon/vue'
import EditoFooter from '~/components/Pages/EditoFooter.vue'
import EditoHeader from '~/components/Pages/EditoHeader.vue'
import PageShowById from '~/components/Pages/PageShowById.vue'

const { t } = useTranslation()
useSeoMeta({
  title: t('APIs'),
})

const config = useRuntimeConfig()
const route = useRoute()

onMounted(async () => {
  const hasFacets = Object.keys(route.query).some(key =>
    ['q', 'sort', 'is_restricted', 'organization', 'page'].includes(key),
  )

  if (hasFacets) {
    await navigateTo({ path: '/dataservices/search', query: route.query })
  }
})

const { data: site } = await useAPI<Site>('/api/1/site')
</script>
