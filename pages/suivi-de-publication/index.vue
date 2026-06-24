<template>
  <div>
    <OnboardingHero
      color="primary"
      image="/nuxt_images/ouvertures.svg"
      image-position="right"
    >
      <template #breadcrumb>
        <Breadcrumb>
          <BreadcrumbItem to="/">
            {{ $t('Accueil') }}
          </BreadcrumbItem>
          <BreadcrumbItem>
            {{ $t('Suivi de publication') }}
          </BreadcrumbItem>
        </Breadcrumb>
      </template>
      <template #title>
        {{ $t('Suivre les ouvertures et mises à disposition des données') }}
      </template>
      <template #subtitle>
        <span class="block">{{ $t('Les données peuvent être mises à disposition en accès libre (open data) ou en accès restreint.') }}</span>
        <span class="block mt-4">{{ $t('Cette rubrique permet de suivre les ouvertures de données annoncées, les demandes en cours, ainsi que les modalités d\'accès associées.') }}</span>
      </template>
    </OnboardingHero>

    <OnboardingSection>
      <OnboardingTitle class="mb-8">
        {{ $t('Voir les différentes catégories de données') }}
      </OnboardingTitle>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <LinkCard
          v-for="category in categories"
          :key="category.title"
          :to="category.to"
          :external="category.external"
          class="flex flex-col p-6"
        >
          <h3 class="text-lg font-bold leading-normal text-gray-title mb-2">
            {{ category.title }}
          </h3>
          <p class="text-base font-normal leading-normal text-gray-plain flex-1 mb-4">
            {{ category.description }}
          </p>
          <component
            :is="category.external ? RiExternalLinkLine : RiArrowRightLine"
            aria-hidden="true"
            class="size-4 text-new-primary self-end mt-auto"
          />
        </LinkCard>
      </div>
    </OnboardingSection>

    <OnboardingSection background="gray">
      <OnboardingTitle class="mb-8">
        {{ $t('Questions fréquentes') }}
      </OnboardingTitle>
      <div class="max-w-4xl">
        <AccordionGroup>
          <Accordion :title="$t('Qu\'est-ce que l\'ouverture des données ?')">
            <div class="space-y-4 text-gray-plain">
              <p>{{ $t('L\'ouverture des données désigne la publication de données en open data, c\'est-à-dire en accès libre, gratuit et réutilisable par toutes et tous.') }}</p>
              <p>{{ $t('Certaines démarches suivies sur ce site peuvent toutefois concerner des données qui ne sont pas publiées en open data, notamment lorsqu\'elles nécessitent des conditions d\'accès spécifiques.') }}</p>
            </div>
          </Accordion>
          <Accordion :title="$t('Quelles données sont présentées ici ?')">
            <div class="space-y-4 text-gray-plain">
              <p>{{ $t('Ce site permet de suivre les démarches d\'ouverture de données publiques annoncées, les demandes d\'ouverture en cours de traitement, les engagements ministériels et les données de forte valeur.') }}</p>
              <p>{{ $t('Il peut également présenter le suivi de données qui ne sont pas ouvertes au sens de l\'open data, mais dont l\'accès ou la mise à disposition fait l\'objet d\'un cadre spécifique.') }}</p>
            </div>
          </Accordion>
          <Accordion :title="$t('Comment faire une demande de publication de données ?')">
            <div class="space-y-4 text-gray-plain">
              <p>
                <TranslationT keypath="Vous pouvez formuler des demandes de publication en open data pour des données encore non identifiées par notre équipe via le forum de {datagouv}. Merci pour vos contributions !">
                  <template #datagouv>
                    <CdataLink
                      to="https://data.gouv.fr"
                      external
                      class="underline"
                    >
                      data.gouv.fr
                    </CdataLink>
                  </template>
                </TranslationT>
              </p>
              <p>{{ $t('Pour certaines données qui ne peuvent pas être publiées en open data, des modalités d\'accès spécifiques peuvent être prévues.') }}</p>
            </div>
          </Accordion>
          <Accordion :title="$t('Qui est derrière ce site ?')">
            <div class="space-y-4 text-gray-plain">
              <p>
                <TranslationT keypath="Ce site est géré par l'équipe de {datagouv}, la plateforme ouverte et communautaire qui vise à centraliser, structurer et faciliter la circulation des données en France.">
                  <template #datagouv>
                    <CdataLink
                      to="https://data.gouv.fr"
                      external
                      class="underline"
                    >
                      data.gouv.fr
                    </CdataLink>
                  </template>
                </TranslationT>
              </p>
              <p>{{ $t('La plateforme est développée et opérée par le département Opérateur des Produits Interministériels de la Direction interministérielle du numérique (DINUM).') }}</p>
            </div>
          </Accordion>
        </AccordionGroup>
      </div>
    </OnboardingSection>
  </div>
</template>

<script setup lang="ts">
import { RiArrowRightLine, RiExternalLinkLine } from '@remixicon/vue'
import { TranslationT } from '@datagouv/components-next'
import OnboardingHero from '~/components/Onboarding/OnboardingHero.vue'
import OnboardingSection from '~/components/Onboarding/OnboardingSection.vue'
import OnboardingTitle from '~/components/Onboarding/OnboardingTitle.vue'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import LinkCard from '~/components/LinkCard.vue'
import CdataLink from '~/components/CdataLink.vue'
import AccordionGroup from '~/components/Accordion/AccordionGroup.global.vue'
import Accordion from '~/components/Accordion/Accordion.global.vue'

const config = useRuntimeConfig()
const { t } = useTranslation()

useSeoMeta({
  title: t('Suivi des ouvertures de données publiques - {site}', { site: config.public.title }),
  description: t('Suivez les ouvertures de données publiques annoncées, les demandes en cours, ainsi que les modalités d\'accès associées.'),
})
defineOgImage('MainPage.takumi', {
  title: 'Ouvertures de données',
  uri: '/suivi-de-publication',
})

const categories = [
  {
    title: t('Demandes de publications et engagements ministériels'),
    description: t('Suivre les prochaines publications de données ouvertes ou restreintes ainsi que les engagements ministériels en matière de données.'),
    to: '/suivi-de-publication/engagements-et-demandes',
    external: false,
  },
  {
    title: t('Données de forte valeur'),
    description: t('Suivre l\'ouverture de données de forte valeur identifiées par la Commission européenne.'),
    to: config.public.ouverturesHvdUrl,
    external: true,
  },
]
</script>
