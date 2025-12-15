<template>
  <div>
    <EditoHeader
      color="purple"
      :title="$t('API')"
      :subtitle="$t('Rechercher parmi les {count} API sur {site}', {
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
    <section class="container w-full pt-16">
      <div>
        <h2 class="font-extrabold text-3xl">
          {{ $t('Des outils pour les administrations') }}
        </h2>
        <p class="text-2xl">
          {{ $t('Acteurs publics, que vous soyez utilisateurs ou fournisseurs d’API,') }}<br />
          {{ $t('des ressources sont à votre disposition :') }}
        </p>
      </div>
       <div class="w-full grid md:grid-cols-3 gap-5 mb-10">
        <div class="flex flex-col space-y-3 justify-center">
           <div class="bg-gray-lowest-2 flex flex-col items-center px-5 py-12 space-y-4">
            <div class=" flex items-center justify-center size-20 bg-white rounded-full">
              <nuxt-img
                src="/illustrations/book-2.svg"
                class="w-18"
              />
            </div>
            <div class="font-extrabold text-center text-lg">
              {{ $t('La doctrine des API') }}
            </div>
            <div class="text-center">
              {{ $t('Elle précise le cadre d’action et identifie les bonnes pratiques à poursuivre en matière d’usage et d’exposition d’API par les administrations.') }}
            </div>
            <BrandedButton
              href="https://guides.data.gouv.fr/guide-data.gouv.fr/api/outils-pour-les-administrations/doctrine-des-api"
              target="_blank"
              rel="noopener noreferrer"
              color="secondary"
              :icon="RiArrowRightLine"
              :icon-right="true"
              size="sm"
              aria-label="Doctrine des API sur guides.data.gouv.fr"
            >
              Lire la doctrine
            </BrandedButton>
          </div>     
          <div class="bg-gray-lowest-2 flex flex-col items-center px-5 py-12 space-y-4">
            <div class=" flex items-center justify-center size-20 bg-white rounded-full">
              <nuxt-img
                src="/illustrations/_keyboard.svg"
                class="w-16"
              />
            </div>
            <div class="font-extrabold text-center text-lg">
            {{ $t('Publier vos API') }}
            </div>
            <div class="text-center">
              {{ $t(`Data.gouv.fr permet l'exposition de vos API en quelques clics.`) }}<br /><br />
              {{ $t(`Créez dès maintenant une page pour votre organisation et référencez vos API :`) }}
            </div>
             <BrandedButton
              href="/admin/dataservices/new"
              target="_blank"
              rel="noopener noreferrer"
              color="brown-illustration"
              :icon="RiArrowRightLine"
              :icon-right="true"
              size="sm"
              aria-label="Documentation API Entreprise"
              >
               Publier une API sur data.gouv.fr
            </BrandedButton>         
          </div>
        </div>
        <div class="flex flex-col space-y-3 justify-center">
          <div class="bg-gray-lowest-2 flex flex-col items-center px-5 py-12 space-y-4">
            <div class=" flex items-center justify-center size-20 bg-white rounded-full">
              <nuxt-img
                src="/illustrations/schema.svg"
                class="w-18"
              />
            </div>
             <div class="font-extrabold text-center text-lg">
            {{ $t('Un accompagnement') }}<br />{{ $t('technique et métier') }}
            </div>
            <div class="text-center">
              {{ $t(`Le pôle Data de la DINUM est disponible pour vous aider pour toute question relative aux API.`) }}
            </div>
            <BrandedButton
              href="https://guides.data.gouv.fr/guide-data.gouv.fr/api/outils-pour-les-administrations/accompagnement-humain"
              target="_blank"
              rel="noopener noreferrer"
              color="secondary"
              :icon="RiArrowRightLine"
              :icon-right="true"
              size="sm"
              aria-label="Accompagnement technique et métier sur guides.data.gouv.fr"
            >
              Demander conseil
            </BrandedButton>
          </div>
          <div class="bg-gray-lowest-2 flex flex-col items-center px-5 py-12 space-y-4">
            <div class=" flex items-center justify-center size-20 bg-white rounded-full">
              <nuxt-img
                src="/illustrations/_keys.svg"
                class="w-20"
              />
            </div>
            <div class="font-extrabold text-center text-lg">
            {{ $t('Datapass') }}<br />{{ $t('Habilitations juridiques') }}

            </div>
            <div class="text-center">
              {{ $t(`DataPass est un outil clé en main pour déposer et instruire des demandes d'accès aux données.`) }}<br /><br />
              {{ $t(`Fournisseurs d'API en accès restreint, mettez en place vos formulaires d'habilitation DataPass :`) }}
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
        </div>
        <div class="flex flex-col space-y-3 justify-center">
          <div class="bg-gray-lowest-2 flex flex-col items-center px-5 py-12 space-y-4">
            <div class=" flex items-center justify-center size-20 bg-white rounded-full">
              <nuxt-img
                src="/illustrations/lightbulb.svg"
                class="w-12"
              />
            </div>
            <div class="font-extrabold text-center text-lg">
            {{ $t('Simplifions.data.gouv.fr') }}
            </div>
            <div class="text-center">
              {{ $t(`Un catalogue des API, données et solutions utiles pour simplifier les démarches administratives.`) }} <br /><br />
              {{ $t(`Consultez Simplifions.data pour vous aider à mettre en oeuvre le Dites-le nous une fois et la proactivité :`) }}
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
              Consulter le catalogue
            </BrandedButton>
          </div>
          <div class="bg-gray-lowest-2 flex flex-col items-center px-5 py-12 space-y-4">
            <div class=" flex items-center justify-center size-20 bg-white rounded-full">
              <nuxt-img
                src="/illustrations/_safe.svg"
                class="w-20"
              />
            </div>
            <div class="font-extrabold text-center text-lg">
              {{ $t('API Entreprise') }}<br />
              {{ $t('et API Particulier') }}
              </div>
            <div class="text-center">
              {{ $t(`Les données des particuliers, des entreprises et associations, accessibles depuis une même API.`) }}
            </div>    
           <BrandedButton
              href="https://entreprise.api.gouv.fr/"
              target="_blank"
              rel="noopener noreferrer"
              color="secondary"
              :icon="RiExternalLinkFill"
              :icon-right="true"
              size="sm"
              aria-label="Documentation API Entreprise"
              >
               API Entreprise
            </BrandedButton>
            <BrandedButton
              href="https://particulier.api.gouv.fr/"
              target="_blank"
              rel="noopener noreferrer"
              color="secondary"
              :icon="RiExternalLinkFill"
              :icon-right="true"
              size="sm"
              aria-label="Documentation API Particulier"
              >
               API Particulier
            </BrandedButton>
             <div class="text-center">              
              {{ $t(`Fournisseurs d'API, les bouquets s'occupent de l'exposition et du support de vos API utiles pour la mise en oeuvre du Dites-le nous une fois.`) }}
              
            </div>
            <BrandedButton
              href="https://guides.data.gouv.fr/guide-data.gouv.fr/api/outils-pour-les-administrations/bouquets-api-entreprise-et-api-particulier#comment-rejoindre-les-bouquets-api-entreprise-api-particulier"
              target="_blank"
              rel="noopener noreferrer"
              color="brown-illustration"
              :icon="RiArrowRightLine"
              :icon-right="true"
              size="sm"
              aria-label="Documentation API Particulier"
              >
               Proposer votre API
            </BrandedButton>
          </div>
        </div>
      </div>
    </section>
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
  title: t('API'),
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
