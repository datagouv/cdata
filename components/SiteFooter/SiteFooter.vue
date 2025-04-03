<template>
  <footer role="contentinfo">
    <div class="bg-white py-6 md:py-8 border-t border-t-gray-default">
      <div class="fr-container">
        <div class="flex flex-wrap divide-y md:divide-y-0 md:divide-x divide-gray-default">
          <div class="w-full md:pr-[6%] md:w-2/3 flex flex-wrap">
            <div class="flex-none flex items-center fr-mr-5v">
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
                  {{ $t("Subscribe to our newsletter") }}
                </p>
                <p class="mb-4">
                  {{
                    $t("To stay up to date about {site} and open data news, subscribe to our newsletter and follow our events.",
                       { site: config.public.title })
                  }}
                </p>
              </div>
              <div class="flex flex-wrap gap-4">
                <BrandedButton
                  color="primary"
                  :title="$t('Subscribe to our newsletter')"
                  :href="config.public.newsletterSubscriptionUrl"
                  :external="true"
                >
                  {{ $t("Subscribe") }}
                </BrandedButton>
                <BrandedButton
                  color="secondary"
                  :title="$t('Subscribe to our newsletter')"
                  href="/pages/webinaires/"
                >
                  {{ $t("See our next events") }}
                </BrandedButton>
              </div>
            </div>
          </div>
          <div class="w-full mt-6 pt-6 md:mt-0 md:pt-0 md:pl-[6%] md:w-1/3">
            <div class="flex flex-col items-start justify-between h-full">
              <p class="font-extrabold text-2xl leading-8 text-gray-title">
                {{ $t("Follow us") }}
                <br> {{ $t("on social media") }}
              </p>
              <ul class="flex justify-between list-none m-0 p-0 *:p-0 -ml-4">
                <li>
                  <a
                    class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                    :title="$t('Linkedin - new tab')"
                    href="https://www.linkedin.com/company/data-gouv-fr/"
                    target="_blank"
                  >
                    <RiLinkedinBoxLine />
                  </a>
                </li>
                <li>
                  <a
                    class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                    :title="$t('Mastodon - new tab')"
                    href="https://social.numerique.gouv.fr/@datagouvfr"
                    target="_blank"
                  >
                    <RiMastodonLine />
                  </a>
                </li>
                <li>
                  <a
                    class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                    :title="$t('Bluesky - new tab')"
                    href="https://bsky.app/profile/datagouvfr.bsky.social"
                    target="_blank"
                  >
                    <RiBlueskyLine />
                  </a>
                </li>
                <li>
                  <a
                    class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                    :title="$t('Github - new tab')"
                    href="https://github.com/datagouv/data.gouv.fr"
                    target="_blank"
                  >
                    <RiGithubLine />
                  </a>
                </li>
                <li>
                  <NuxtLinkLocale
                    class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                    :title="$t('RSS - new tab')"
                    to="datasets/recent.atom"
                    :external="true"
                    target="_blank"
                  >
                    <RiRssLine />
                  </NuxtLinkLocale>
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
                {{ $t('Open Data') }}
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
                {{ $t('Platform') }}
              </h3>
              <ul class="fr-footer__top-list">
                <li
                  v-for="item in platformLinks"
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
                {{ $t('Resources') }}
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
                {{ $t('Development') }}
              </h3>
              <ul class="fr-footer__top-list">
                <li>
                  <a
                    :href="config.public.apiDocExternalLink"
                    class="fr-footer__top-link"
                  >
                    {{ $t("Portal's API") }}
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/opendatateam/udata/"
                    class="fr-footer__top-link"
                  >
                    {{ $t('Open-source engine: udata') }}
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/datagouv/cdata/"
                    :title="$t('data.gouv.fr extension: cdata')"
                    class="fr-footer__top-link"
                  >
                    {{ $t('data.gouv.fr front-end') }}
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
              :title="$t('Go back to website home - data.gouv.fr - République Française')"
            >
              <SiteLogo class="text-gray-logo text-xl tracking-wide" />
            </a>
          </div>
          <div class="fr-footer__content">
            <p class="fr-footer__content-desc">
              {{ $t("A product of the Direction Interministérielle du Numérique(DINUM).") }}
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
              <NuxtLinkLocale
                :to="item.link"
                :external="true"
                class="fr-footer__bottom-link"
              >
                {{ item.label }}
              </NuxtLinkLocale>
            </li>
          </ul>
          <div class="fr-footer__bottom-copy">
            <p>
              {{ $t("Unless otherwise stated, all content of this site is availabe under") }}
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
import { RiBlueskyLine, RiGithubLine, RiLinkedinBoxLine, RiMastodonLine, RiRssLine, RiTwitterLine } from '@remixicon/vue'

const config = useRuntimeConfig()

const { t } = useI18n()

type Link = {
  label: string
  link: string
}

const openDataLinks: Array<Link> = [
  { label: t('Topics'), link: '/pages/thematiques-a-la-une' },
  { label: t('Reference Data'), link: '/pages/spd/reference' },
]

if (config.public.csvDatasetId) {
  openDataLinks.push({ label: t('Data catalog'), link: `/datasets/${config.public.csvDatasetId}` })
}

openDataLinks.push({ label: t('Follow data opening'), link: 'https://ouverture.data.gouv.fr' })
openDataLinks.push({ label: t('Portal for European data'), link: 'https://data.europa.eu' })

const platformLinks: Array<Link> = [
  { label: t('Guides'), link: config.public.guidesUrl },
  { label: t('Roadmap and news'), link: '/pages/roadmap' },
  { label: t('Contact us'), link: '/support' },
  { label: t('Give us your feedback'), link: config.public.feedbackFormUrl },
  { label: t('Statistics'), link: '/dashboard' },
]

const resourcesLinks: Array<Link> = [
  { label: 'api.gouv.fr', link: 'https://api.gouv.fr' },
  { label: config.public.schemasSite.name, link: config.public.schemasSite.url },
  { label: 'meteo.data.gouv.fr', link: 'https://meteo.data.gouv.fr' },
  { label: 'transport.data.gouv.fr', link: 'https://transport.data.gouv.fr' },
  { label: 'defis.data.gouv.fr', link: 'https://defis.data.gouv.fr' },
]

const footerLinks: Array<Link> = [
  { label: t('Licenses'), link: '/pages/legal/licences' },
  { label: t('Terms of use'), link: '/pages/legal/cgu' },
  { label: t('Tracking and privacy'), link: '/pages/gouvfr.suivi' },
  { label: t('Legal notice'), link: '/pages/legal/legal-notice' },
  { label: t('Accessibility: partially compliant'), link: '/pagelegal/accessibility' },
]

const networkLinks: Array<Link> = [
  { label: 'legifrance.gouv.fr', link: 'https://legifrance.gouv.fr' },
  { label: 'info.gouv.fr', link: 'https://www.info.gouv.fr' },
  { label: 'service-public.fr', link: 'https://www.service-public.fr' },
]
</script>
