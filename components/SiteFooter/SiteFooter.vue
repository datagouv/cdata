<template>
  <footer role="contentinfo">
    <div class="bg-white py-6 md:py-8 border-t border-t-gray-default">
      <div class="fr-container">
        <div class="flex flex-wrap divide-y md:divide-y-0 md:divide-x divide-gray-default">
          <div class="w-full pb-6 md:pb-0 md:pr-[6%] md:w-2/3 flex flex-wrap">
            <div class="flex-none hidden sm:flex items-center mr-5">
              <NuxtImg
                src="/illustrations/newspaper-black.svg"
                aria-hidden="true"
                loading="lazy"
                width="71"
                height="55"
              />
            </div>
            <div class="w-full !flex-none sm:!flex-1">
              <div class="mb-4">
                <p class="font-extrabold text-2xl text-gray-title leading-8 mb-1">
                  {{ $t("Abonnez-vous à notre lettre d'information") }}
                </p>
                <p class="hidden sm:block mb-4">
                  {{
                    $t("Pour ne rien manquer de l’actualité de {site} et de l’open data, inscrivez-vous à notre infolettre et suivez nos événements.",
                       { site: config.public.title })
                  }}
                </p>
              </div>
              <div class="flex flex-wrap gap-4">
                <BrandedButton
                  color="primary"
                  :title="$t(`Abonnez-vous à notre lettre d'information`)"
                  :href="config.public.newsletterSubscriptionUrl"
                  :external="true"
                >
                  {{ $t("Abonnez-vous") }}
                </BrandedButton>
                <BrandedButton
                  color="secondary"
                  :title="$t(`Abonnez-vous à notre lettre d'information`)"
                  href="/events/rentree-data-gouv"
                >
                  {{ $t("Voir nos prochains évènements") }}
                </BrandedButton>
              </div>
            </div>
          </div>
          <div class="w-full mt-6 pt-6 md:mt-0 md:pt-0 md:pl-[6%] md:w-1/3">
            <div class="flex flex-col items-start justify-between h-full">
              <p class="font-extrabold text-2xl leading-8 text-gray-title">
                {{ $t("Suivez-nous") }}
                <br> {{ $t("sur les réseaux sociaux") }}
              </p>
              <ul class="flex flex-wrap list-none m-0 p-0 *:p-0 -ml-4">
                <li>
                  <a
                    class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                    :title="$t('Linkedin - nouvel onglet')"
                    href="https://www.linkedin.com/company/data-gouv-fr/"
                    target="_blank"
                  >
                    <RiLinkedinBoxLine aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                    :title="$t('Mastodon - nouvel onglet')"
                    href="https://social.numerique.gouv.fr/@datagouvfr"
                    target="_blank"
                  >
                    <RiMastodonLine aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                    :title="$t('Bluesky - nouvel onglet')"
                    href="https://bsky.app/profile/datagouvfr.bsky.social"
                    target="_blank"
                  >
                    <RiBlueskyLine aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                    :title="$t('Youtube - nouvel onglet')"
                    href="https://www.youtube.com/@data-gouv-fr"
                    target="_blank"
                  >
                    <RiYoutubeLine aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                    :title="$t('Github - nouvel onglet')"
                    href="https://github.com/datagouv/data.gouv.fr"
                    target="_blank"
                  >
                    <RiGithubLine aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <CdataLink
                    class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                    :title="$t('RSS - nouvel onglet')"
                    to="/datasets/recent.atom"
                    :external="true"
                    target="_blank"
                  >
                    <RiRssLine aria-hidden="true" />
                  </CdataLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      id="footer"
      class="fr-footer !shadow-none border-t-2 border-t-gray-title"
    >
      <div class="fr-footer__top">
        <div class="fr-container">
          <div class="fr-grid-row fr-grid-row--start fr-grid-row--gutters">
            <div class="fr-col-12 fr-col-sm-3">
              <p class="fr-footer__top-cat !text-xs !leading-5 !mb-3">
                {{ $t('Données ouvertes') }}
              </p>
              <ul class="fr-footer__top-list">
                <li
                  v-for="item in openDataLinks"
                  :key="item.label"
                >
                  <a
                    class="fr-footer__top-link"
                    :href="item.link"
                  >{{ item.label }}</a>
                </li>
              </ul>
            </div>
            <div class="fr-col-12 fr-col-sm-3">
              <p class="fr-footer__top-cat !text-xs !leading-5 !mb-3">
                {{ $t('Plateforme') }}
              </p>
              <ul class="fr-footer__top-list">
                <li
                  v-for="item in platformLinks"
                  :key="item.label"
                >
                  <CdataLink
                    class="fr-footer__top-link"
                    :to="item.link"
                    :external="item.external"
                  >
                    {{ item.label }}
                  </CdataLink>
                </li>
              </ul>
            </div>
            <div class="fr-col-12 fr-col-sm-3">
              <p class="fr-footer__top-cat !text-xs !leading-5 !mb-3">
                {{ $t('Verticales thématiques') }}
              </p>
              <ul class="fr-footer__top-list">
                <li
                  v-for="item in resourcesLinks"
                  :key="item.label"
                >
                  <a
                    class="fr-footer__top-link"
                    :href="item.link"
                  >{{ item.label }}</a>
                </li>
              </ul>
            </div>
            <div class="fr-col-12 fr-col-sm-3">
              <p class="fr-footer__top-cat !text-xs !leading-5 !mb-3">
                {{ $t('Développement') }}
              </p>
              <ul class="fr-footer__top-list">
                <li>
                  <a
                    :href="config.public.apiDocExternalLink"
                    class="fr-footer__top-link"
                  >
                    {{ $t("API du portail") }}
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/opendatateam/udata/"
                    class="fr-footer__top-link"
                    :title="site && site.version ? $t('Version {version}', { version: site.version }) : undefined"
                  >
                    {{ $t('Moteur open source : udata ({version})', { version: site?.version ?? '' }) }}
                  </a>
                </li>
                <li>
                  <a
                    :href="appConfig.commitId ? `https://github.com/datagouv/cdata/commit/${appConfig.commitId}` : 'https://github.com/datagouv/cdata/'"
                    :title="appConfig.commitId ? $t('Version {version}', { version: appConfig.commitId }) : undefined"
                    class="fr-footer__top-link"
                  >
                    {{ $t('Interface utilisateur de data.gouv.fr : cdata ({version})', { version: appConfig.commitId }) }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="fr-container">
        <div class="fr-footer__body">
          <div class="fr-footer__brand fr-enlarge-link">
            <p
              v-if="appConfig.isFrenchGovernment"
              class="fr-logo"
              title="république française"
            >
              république
              <br>française
            </p>
            <p v-else>
              Add Your logo
            </p>
            <a
              class="fr-footer__brand-link"
              href="/"
              :title="$t(`Retourner à l'accueil du site - data.gouv.fr - République Française`)"
            >
              <LogoImage class="h-12" />
            </a>
          </div>
          <div class="fr-footer__content">
            <p class="fr-footer__content-desc">
              {{ $t("Un produit de la Direction Interministérielle du Numérique (DINUM).") }}
            </p>
            <ul class="fr-footer__content-list">
              <li
                v-for="item in networkLinks"
                :key="item.label"
                class="fr-footer__content-item"
              >
                <a
                  class="fr-footer__content-link"
                  target="_blank"
                  :href="item.link"
                >{{ item.label }}</a>
              </li>
            </ul>
          </div>
          <div class="fr-col-auto fr-ml-auto self-end" />
        </div>
        <div class="fr-footer__bottom">
          <ul class="fr-footer__bottom-list">
            <li
              v-for="item in footerLinks"
              :key="item.label"
              class="fr-footer__bottom-item"
            >
              <CdataLink
                :to="item.link"
                :external="item.external ?? false"
                class="fr-footer__bottom-link"
              >
                {{ item.label }}
              </CdataLink>
            </li>
          </ul>
          <div class="fr-footer__bottom-copy">
            <p>
              {{ $t("Sauf indication contraire, tout le contenu de ce site est disponible sous la licence") }}
              <a
                href="https://github.com/etalab/licence-ouverte/blob/master/LO.md#licence-ouverte-20open-licence-20"
                target="_blank"
              >
                Open Licence 2.0
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { BrandedButton, type Site } from '@datagouv/components-next'
import { RiBlueskyLine, RiGithubLine, RiLinkedinBoxLine, RiMastodonLine, RiRssLine, RiYoutubeLine } from '@remixicon/vue'

const config = useRuntimeConfig()
const appConfig = useAppConfig()

const { t } = useTranslation()

type Link = {
  label: string
  link: string
  external?: boolean
}

const openDataLinks: Array<Link> = [
  { label: t('Thématiques'), link: '/pages/thematiques-a-la-une' },
  { label: t('Données de référence'), link: '/pages/spd/reference' },
]

if (config.public.csvDatasetId) {
  openDataLinks.push({ label: t('Catalogue de données'), link: `/datasets/${config.public.csvDatasetId}` })
}

openDataLinks.push({ label: t(`Suivre l'ouverture des données`), link: 'https://ouverture.data.gouv.fr' })
openDataLinks.push({ label: t('Portail des données européennes'), link: 'https://data.europa.eu' })
openDataLinks.push({ label: config.public.schemasSite.name, link: config.public.schemasSite.url })

const platformLinks: Array<Link> = [
  { label: t('Guides'), link: config.public.guidesUrl, external: true },
  { label: t('Feuille de route et nouveautés'), link: '/products/datagouv?tab=roadmap' },
  { label: t('Nous écrire'), link: '/support' },
  { label: t('Échangez avec la communauté'), link: config.public.forumUrl, external: true },
  { label: t('Statistiques'), link: '/dashboard' },
]

const resourcesLinks: Array<Link> = [
  { label: 'meteo.data.gouv.fr', link: 'https://meteo.data.gouv.fr' },
  { label: 'transport.data.gouv.fr', link: 'https://transport.data.gouv.fr' },
  { label: 'ecologie.data.gouv.fr', link: 'https://ecologie.data.gouv.fr' },
  { label: 'defis.data.gouv.fr', link: 'https://defis.data.gouv.fr' },
  { label: 'culture.data.gouv.fr', link: 'https://culture.data.gouv.fr' },
  { label: 'logistique.data.gouv.fr', link: 'https://logistique.data.gouv.fr' },
]

const footerLinks: Array<Link> = [
  { label: t('Licences'), link: '/pages/legal/licences' },
  { label: t(`Modalités d'utilisation`), link: '/pages/legal/cgu' },
  { label: t('Politique de confidentialité'), link: '/pages/suivi' },
  { label: t('Mentions légales'), link: '/pages/legal/legal-notice' },
  { label: t('Accessibilité : partiellement conforme'), link: '/pages/legal/accessibility' },
]

const networkLinks: Array<Link> = [
  { label: 'legifrance.gouv.fr', link: 'https://legifrance.gouv.fr' },
  { label: 'info.gouv.fr', link: 'https://www.info.gouv.fr' },
  { label: 'service-public.fr', link: 'https://www.service-public.fr' },
]

const { data: site } = await useAPI<Site>('/api/1/site/')
</script>
