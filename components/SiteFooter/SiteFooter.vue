<template>
  <footer role="contentinfo">
    <div class="bg-white py-6 md:py-8 border-t border-t-gray-default">
      <div class="fr-container">
        <div class="flex flex-wrap divide-y md:divide-y-0 md:divide-x divide-gray-default">
          <div class="w-full pb-6 md:pb-0 md:pr-[6%] md:w-2/3 flex flex-wrap">
            <div class="flex-none flex items-center mr-5">
              <NuxtImg
                src="/img/newspaper.svg"
                loading="lazy"
                width="71"
                height="55"
              />
            </div>
            <div class="w-full !flex-none sm:!flex-1">
              <div>
                <p class="font-extrabold text-2xl text-gray-title leading-8 mb-1">
                  {{ $t("Abonnez-vous à notre lettre d'information") }}
                </p>
                <p class="mb-4">
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
                  href="/pages/webinaires/"
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
              <ul class="flex justify-between list-none m-0 p-0 *:p-0 -ml-4">
                <li>
                  <a
                    class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                    :title="$t('Linkedin - nouvel onglet')"
                    href="https://www.linkedin.com/company/data-gouv-fr/"
                    target="_blank"
                  >
                    <RiLinkedinBoxLine />
                  </a>
                </li>
                <li>
                  <a
                    class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                    :title="$t('Mastodon - nouvel onglet')"
                    href="https://social.numerique.gouv.fr/@datagouvfr"
                    target="_blank"
                  >
                    <RiMastodonLine />
                  </a>
                </li>
                <li>
                  <a
                    class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                    :title="$t('Bluesky - nouvel onglet')"
                    href="https://bsky.app/profile/datagouvfr.bsky.social"
                    target="_blank"
                  >
                    <RiBlueskyLine />
                  </a>
                </li>
                <li>
                  <a
                    class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                    :title="$t('Github - nouvel onglet')"
                    href="https://github.com/datagouv/data.gouv.fr"
                    target="_blank"
                  >
                    <RiGithubLine />
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
                    <RiRssLine />
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
              <h3 class="fr-footer__top-cat !text-xs !leading-5 !mb-3">
                {{ $t('Données ouvertes') }}
              </h3>
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
              <h3 class="fr-footer__top-cat !text-xs !leading-5 !mb-3">
                {{ $t('Plateforme') }}
              </h3>
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
              <h3 class="fr-footer__top-cat !text-xs !leading-5 !mb-3">
                {{ $t('Ressources') }}
              </h3>
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
              <h3 class="fr-footer__top-cat !text-xs !leading-5 !mb-3">
                {{ $t('Développement') }}
              </h3>
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
                  >
                    {{ $t('Moteur open source : udata') }}
                  </a>
                </li>
                <li>
                  <a
                    :href="config.public.commitId ? `https://github.com/datagouv/cdata/commit/${config.public.commitId}` : 'https://github.com/datagouv/cdata/'"
                    :title="config.public.commitId ? $t('Version {version}', { version: config.public.commitId }) : undefined"
                    class="fr-footer__top-link"
                  >
                    {{ $t('Interface utilisateur de data.gouv.fr : cdata') }}
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
              class="fr-logo"
              title="république française"
            >
              république
              <br>française
            </p>
            <a
              class="fr-footer__brand-link"
              href="/"
              :title="$t(`Retourner à l'accueil du site - data.gouv.fr - République Française`)"
            >
              <SiteLogo class="text-gray-logo text-xl tracking-wide" />
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
import { BrandedButton } from '@datagouv/components-next'
import { RiBlueskyLine, RiGithubLine, RiLinkedinBoxLine, RiMastodonLine, RiRssLine } from '@remixicon/vue'

const config = useRuntimeConfig()

const { t } = useI18n()

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

const platformLinks: Array<Link> = [
  { label: t('Guides'), link: config.public.guidesUrl, external: true },
  { label: t('Feuille de route et nouveautés'), link: '/pages/roadmap' },
  { label: t('Nous écrire'), link: '/support' },
  { label: t('Donnez votre avis'), link: config.public.feedbackFormUrl, external: true },
  { label: t('Statistiques'), link: '/dashboard' },
]

const resourcesLinks: Array<Link> = [
  { label: config.public.schemasSite.name, link: config.public.schemasSite.url },
  { label: 'meteo.data.gouv.fr', link: 'https://meteo.data.gouv.fr' },
  { label: 'transport.data.gouv.fr', link: 'https://transport.data.gouv.fr' },
  { label: 'ecologie.data.gouv.fr', link: 'https://ecologie.data.gouv.fr' },
  { label: 'defis.data.gouv.fr', link: 'https://defis.data.gouv.fr' },
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
</script>
