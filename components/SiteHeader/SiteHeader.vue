<template>
  <header
    role="banner"
    class="fr-header"
  >
    <div
      v-if="config.public.banner"
      class="bg-primary text-white py-4"
    >
      <div
        class="fr-container"
        v-html="config.public.banner"
      />
    </div>
    <div class="fr-header__body">
      <div
        class="fr-container"
        :class="{ '!max-w-none': fluid }"
      >
        <div class="fr-header__body-row">
          <div class="fr-header__brand fr-enlarge-link">
            <div class="fr-header__brand-top">
              <div class="fr-header__logo">
                <p class="fr-logo">
                  République <br>Française
                </p>
              </div>
              <div class="lg:!hidden flex flex-row items-start justify-end p-1 -mr-1 mt-1 order-3 flex-1 self-stretch z-[1000] gap-3">
                <ModalWithButton
                  :title="$t('Recherche')"
                  :show-title="false"
                  size="fullscreen"
                >
                  <template #button="{ attrs, listeners }">
                    <button
                      class="flex-none w-10 h-10 text-primary inline-flex items-center justify-center"
                      :title="$t('Recherche')"
                      v-bind="attrs"
                      v-on="listeners"
                    >
                      <RiSearchLine class="size-6" />
                    </button>
                  </template>
                  <template #default="{ close }">
                    <div class="w-full fr-container fr-container-lg--fluid">
                      <div class="fr-header__search">
                        <MenuSearch @selected="close" />
                      </div>
                    </div>
                  </template>
                </ModalWithButton>
                <ModalWithButton
                  :title="$t('Menu')"
                  :show-title="false"
                  size="fullscreen"
                  class="fr-header-menu"
                >
                  <template #button="{ attrs, listeners }">
                    <button
                      class="flex-none w-10 h-10 text-primary border-solid border border-gray-300 inline-flex items-center justify-center"
                      :title="$t('Menu')"
                      v-bind="attrs"
                      v-on="listeners"
                    >
                      <RiMenuLine class="size-6" />
                    </button>
                  </template>
                  <template #default>
                    <div class="fr-container">
                      <div class="fr-header__menu-links">
                        <ul
                          v-if="me"
                          class="list-none"
                        >
                          <li>
                            <BrandedButton
                              :href="me.page"
                              color="primary-softer"
                              class="w-full"
                              size="lg"
                              :icon="NuxtImg"
                              :icon-attrs="{
                                src: getUserAvatar(me, 24),
                                loading: 'lazy',
                                alt: '',
                                class: 'rounded-full',
                              }"
                            >
                              {{ me.first_name }} {{ me.last_name }}
                            </BrandedButton>
                          </li>
                          <li>
                            <BrandedButton
                              href="/admin/"
                              :external="true"
                              color="primary-softer"
                              :icon="RiSettings3Line"
                              class="w-full"
                              size="lg"
                            >
                              {{ $t("Administration") }}
                            </BrandedButton>
                          </li>
                          <li>
                            <BrandedButton
                              v-if="config.public.enableCdataSecurityViews"
                              type="button"
                              :icon="RiLogoutBoxRLine"
                              color="primary-softer"
                              class="w-full"
                              size="lg"
                              @click="logout"
                            >
                              {{ $t('Se déconnecter') }}
                            </BrandedButton>
                            <BrandedButton
                              v-else
                              :href="`${config.public.apiBase}/logout`"
                              :icon="RiLogoutBoxRLine"
                              :external="true"
                              color="primary-softer"
                              class="w-full"
                              size="lg"
                            >
                              {{ $t('Se déconnecter') }}
                            </BrandedButton>
                          </li>
                        </ul>
                        <ul
                          v-else
                          class="list-none"
                        >
                          <li>
                            <BrandedButton
                              :href="{ path: '/login', query: { next: route.fullPath } }"
                              color="primary-softer"
                              size="lg"
                              :external="true"
                              :icon="RiLockLine"
                              class="w-full"
                            >
                              {{ $t("Se connecter") }}
                            </BrandedButton>
                          </li>
                          <li>
                            <BrandedButton
                              color="primary-softer"
                              size="lg"
                              :href="{ path: '/register', query: { next: route.fullPath } }"
                              :external="true"
                              class="w-full"
                              :icon="RiAccountCircleLine"
                            >
                              {{ $t("S'enregistrer") }}
                            </BrandedButton>
                          </li>
                        </ul>
                      </div>
                      <nav
                        class="fr-nav"
                        role="navigation"
                        :aria-label="$t('Menu principal')"
                      >
                        <ul class="fr-nav__list">
                          <li
                            v-for="link in menu"
                            :key="`${link.link}-${$route.path}`"
                            class="fr-nav__item"
                          >
                            <CdataLink
                              v-if="link.link"
                              class="fr-nav__link"
                              :to="link.link"
                              target="_self"
                              :external="link.external"
                              :aria-current="getAriaCurrent(localePath(link.link))"
                            >
                              {{ link.label }}
                            </CdataLink>
                            <ClientOnly v-else-if="link.items">
                              <Disclosure>
                                <DisclosureButton
                                  class="fr-nav__btn"
                                >
                                  {{ link.label }}
                                </DisclosureButton>
                                <DisclosurePanel
                                  class="fr-menu"
                                >
                                  <ul class="fr-menu__list">
                                    <li
                                      v-for="item in link.items"
                                      :key="item.label"
                                    >
                                      <DisclosureButton
                                        :as="CdataLink"
                                        class="fr-nav__link"
                                        :to="item.link"
                                        :external="true"
                                      >
                                        {{ item.label }}
                                      </DisclosureButton>
                                    </li>
                                  </ul>
                                </DisclosurePanel>
                              </Disclosure>
                            </ClientOnly>
                          </li>
                          <li
                            class="fr-nav__item"
                          >
                            <ClientOnly v-if="!config.public.readOnlyMode">
                              <Disclosure>
                                <DisclosureButton
                                  class="fr-nav__btn justify-start after:!ml-auto"
                                >
                                  <RiAddLine class="size-4 mr-1" />
                                  <span>
                                    {{ $t('Publier sur') }}
                                    <SiteLogo />
                                  </span>
                                </DisclosureButton>
                                <DisclosurePanel
                                  class="fr-menu"
                                >
                                  <ul class="fr-menu__list">
                                    <li
                                      v-for="item in filteredPublishMenu"
                                      :key="item.link"
                                    >
                                      <CdataLink
                                        class="fr-nav__link flex items-center space-x-1"
                                        :to="item.link"
                                      >
                                        <component
                                          :is="item.icon"
                                          class="inline size-4"
                                        />
                                        <span>{{ item.label }}</span>
                                      </CdataLink>
                                    </li>
                                  </ul>
                                </DisclosurePanel>
                              </Disclosure>
                            </ClientOnly>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </template>
                </ModalWithButton>
              </div>
            </div>
            <div class="fr-header__service">
              <a
                href="/"
                :title="$t(`Retourner à l'accueil de data.gouv.fr`)"
              >
                <SiteLogo class="text-gray-logo text-xl tracking-wide" />
              </a>
            </div>
          </div>
          <div class="fr-header__tools">
            <div class="fr-header__tools-links">
              <ClientOnly v-if="me">
                <ul class="list-none flex space-x-7">
                  <li>
                    <BrandedButton
                      :href="me.page"
                      color="primary-softer"
                      :icon="NuxtImg"
                      :icon-attrs="{
                        src: getUserAvatar(me, 24),
                        loading: 'lazy',
                        alt: '',
                        class: 'rounded-full',
                      }"
                    >
                      {{ me.first_name }} {{ me.last_name }}
                    </BrandedButton>
                  </li>
                  <li>
                    <BrandedButton
                      href="/admin/"
                      color="primary-softer"
                      :icon="RiSettings3Line"
                    >
                      {{ $t("Administration") }}
                    </BrandedButton>
                  </li>
                  <li>
                    <BrandedButton
                      v-if="config.public.enableCdataSecurityViews"
                      type="button"
                      color="primary-softer"
                      :icon="RiLogoutBoxRLine"
                      @click="logout"
                    >
                      {{ $t('Se déconnecter') }}
                    </BrandedButton>
                    <BrandedButton
                      v-else
                      :href="`${config.public.apiBase}/logout`"
                      color="primary-softer"
                      :icon="RiLogoutBoxRLine"
                      external
                    >
                      {{ $t('Se déconnecter') }}
                    </BrandedButton>
                  </li>
                </ul>
              </ClientOnly>
              <ul
                v-else
                class="list-none flex space-x-7"
              >
                <li>
                  <BrandedButton
                    color="primary-softer"
                    :href="{ path: '/login', query: { next: route.fullPath } }"
                    :external="true"
                    :icon="RiLockLine"
                  >
                    {{ $t("Se connecter") }}
                  </BrandedButton>
                </li>
                <li>
                  <BrandedButton
                    color="primary-softer"
                    :href="{ path: '/register', query: { next: route.fullPath } }"
                    :external="true"
                    :icon="RiAccountCircleLine"
                  >
                    {{ $t("S'enregistrer") }}
                  </BrandedButton>
                </li>
              </ul>
            </div>
            <div
              class="fr-header__search"
            >
              <div class="!hidden lg:!block">
                <MenuSearch />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="fr-header__menu fr-hidden fr-unhidden-lg"
    >
      <div
        class="fr-container"
        :class="{ '!max-w-none !overflow-hidden': fluid }"
      >
        <nav
          class="fr-nav"
          role="navigation"
          :aria-label="$t('Menu principal')"
        >
          <ul class="fr-nav__list">
            <li
              v-for="link in menu"
              :key="`${link.link}-${$route.path}`"
              class="fr-nav__item"
            >
              <CdataLink
                v-if="link.link"
                class="fr-nav__link"
                :to="link.link"
                target="_self"
                :external="link.external"
                :aria-current="getAriaCurrent(localePath(link.link))"
              >
                {{ link.label }}
              </CdataLink>
              <ClientOnly v-else-if="link.items">
                <Disclosure>
                  <DisclosureButton
                    class="fr-nav__btn"
                  >
                    {{ link.label }}
                  </DisclosureButton>
                  <DisclosurePanel
                    class="fr-menu"
                  >
                    <ul class="fr-menu__list">
                      <li
                        v-for="item in link.items"
                        :key="item.label"
                      >
                        <CdataLink
                          class="fr-nav__link"
                          :to="item.link"
                          :external="true"
                        >
                          {{ item.label }}
                        </CdataLink>
                      </li>
                    </ul>
                  </DisclosurePanel>
                </Disclosure>
              </ClientOnly>
            </li>
            <li
              class="fr-nav__item ml-auto sm:!hidden xl:!flex"
            >
              <ClientOnly v-if="!config.public.readOnlyMode">
                <Popover>
                  <PopoverButton
                    class="fr-nav__btn !w-64 inline after:!align-middle"
                  >
                    <RiAddLine class="inline size-4 mr-1" />
                    <span>
                      {{ $t('Publier sur') }}
                      <SiteLogo />
                    </span>
                  </PopoverButton>
                  <PopoverPanel
                    v-slot="{ close }"
                    class="fr-menu"
                  >
                    <ul
                      class="fr-menu__list !w-64"
                    >
                      <li
                        v-for="item in filteredPublishMenu"
                        :key="item.link"
                      >
                        <CdataLink
                          class="fr-nav__link flex items-center space-x-1"
                          :to="item.link"
                          @click="close()"
                        >
                          <component
                            :is="item.icon"
                            class="size-4 -mt-1"
                          />
                          <span>{{ item.label }}</span>
                        </CdataLink>
                      </li>
                    </ul>
                  </PopoverPanel>
                </Popover>
              </ClientOnly>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { BrandedButton, getUserAvatar } from '@datagouv/components-next'
import { RiAccountCircleLine, RiAddLine, RiDatabase2Line, RiGovernmentLine, RiLockLine, RiMenuLine, RiSearchLine, RiRobot2Line, RiLineChartLine, RiServerLine, RiArticleLine, RiSettings3Line, RiLogoutBoxRLine } from '@remixicon/vue'
import { Disclosure, DisclosureButton, DisclosurePanel, Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import CdataLink from '../CdataLink.vue'
import { NuxtImg } from '#components'
import SiteLogo from '~/components/SiteLogo.vue'
import { useMaybeMe } from '~/utils/auth'

defineProps<{
  fluid?: boolean
}>()

const { t } = useI18n()
const config = useRuntimeConfig()
const localePath = useLocalePath()
const me = useMaybeMe()
const currentRoute = useRoute()
const router = useRouter()
const route = useRoute()

const menu = [
  { label: t('Données'), link: '/datasets/' },
  { label: t('API'), link: '/dataservices/' },
  { label: t('Réutilisations'), link: '/reuses/' },
  { label: t('Organisations'), link: '/organizations/' },
  { label: t('Démarrer sur {site}', { site: config.public.title }), items: [
    { label: t(`Qu'est-ce que {site} ?`, { site: config.public.title }), link: '/pages/about/a-propos_data-gouv/' },
    { label: t('Comment publier des données ?'), link: '/pages/onboarding/producteurs/' },
    { label: t('Comment utiliser des données ?'), link: '/pages/onboarding/reutilisateurs/' },
    { label: t('Les guides {site}', { site: config.public.title }), link: config.public.guidesUrl, external: true },
  ], external: true },
  { label: t('Nouveautés'), link: '/posts/' },
  { label: t('Nous écrire'), link: '/support/' },
]

const publishMenu = [
  { label: t('Un jeu de données'), icon: RiDatabase2Line, link: '/admin/datasets/new/' },
  { label: t('Une API'), icon: RiRobot2Line, link: '/admin/dataservices/new/' },
  { label: t('Une réutilisation'), icon: RiLineChartLine, link: '/admin/reuses/new/' },
  { label: t('Un moissonneur'), icon: RiServerLine, link: '/admin/harvesters/new/' },
  { label: t('Une organisation'), icon: RiGovernmentLine, link: '/admin/organizations/new/' },
  { label: t('Un article'), icon: RiArticleLine, link: '/admin/posts/new/', show: isMeAdmin() },
]

const filteredPublishMenu = computed(() => publishMenu.filter(item => !('show' in item) || item.show))

function getAriaCurrent(link: string) {
  if (currentRoute.path === link) {
    return 'page'
  }
  const routesInPath = router.getRoutes().map(route => route.path).filter(path => currentRoute.path.startsWith(path))
  return routesInPath.includes(link)
}

const { $api } = useNuxtApp()
const token = useToken()
const logout = async () => {
  token.value = null
  refreshCookie('token')

  await $api('/fr/logout/', {
    method: 'POST',
  })

  me.value = null
  await navigateTo('/')
}

const { toast } = useToast()
onMounted(() => {
  const FLASH_MESSAGES: Record<string, { type: 'success' | 'error', text: string }> = {
    connected: { type: 'success', text: t('Vous êtes maintenant connecté.') },
    change_email_confirmed: { type: 'success', text: t('Votre nouvelle adresse email est maintenant confirmée.') },
    change_email_expired: { type: 'error', text: t('Le code de vérification de votre adresse email a expiré, un nouveau mail vous a été envoyé.') },
    change_email_invalid: { type: 'error', text: t('Le code de vérification de votre adresse email est incorrect.') },
  }

  if (route.query.flash) {
    const message = FLASH_MESSAGES[route.query.flash as string] || null
    if (message) toast[message.type](message.text)
  }
})
</script>
