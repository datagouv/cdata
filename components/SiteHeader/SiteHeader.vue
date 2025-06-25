<template>
  <header
    role="banner"
    class="fr-header"
  >
    <div
      v-if="config.public.banner"
      class="bg-primary text-white py-4"
    >
      <div class="fr-container">
        {{ config.public.banner }}
      </div>
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
                  :title="$t('Search')"
                  :show-title="false"
                  size="fullscreen"
                >
                  <template #button="{ attrs, listeners }">
                    <button
                      class="flex-none w-10 h-10 text-primary inline-flex items-center justify-center"
                      :title="$t('Search')"
                      v-bind="attrs"
                      v-on="listeners"
                    >
                      <RiSearchLine class="size-6" />
                    </button>
                  </template>
                  <template #default>
                    <div class="w-full fr-container fr-container-lg--fluid">
                      <div
                        class="fr-search-bar"
                        role="search"
                      >
                        <label
                          class="fr-label"
                          :for="searchInputId"
                        > {{ $t('Search') }} </label> <input
                          :id="searchInputId"
                          class="fr-input"
                          :placeholder="$t('Search')"
                          type="search"
                        > <BrandedButton
                          type="submit"
                          color="primary"
                          class="rounded-l-none rounded-br-none rounded-tr-[0.25rem]"
                          :title="$t('Search')"
                        >
                          {{ $t('Search') }}
                        </BrandedButton>
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
                              :href="`${config.public.apiBase}/logout`"
                              :icon="RiLogoutBoxRLine"
                              :external="true"
                              color="primary-softer"
                              class="w-full"
                              size="lg"
                            >
                              {{ $t('Logout') }}
                            </BrandedButton>
                          </li>
                        </ul>
                        <ul
                          v-else
                          class="list-none"
                        >
                          <li>
                            <BrandedButton
                              href="/login"
                              color="primary-softer"
                              size="lg"
                              :icon="RiLockLine"
                              class="w-full"
                            >
                              {{ $t("Log in") }}
                            </BrandedButton>
                          </li>
                          <li>
                            <BrandedButton
                              color="primary-softer"
                              size="lg"
                              href="/register"
                              class="w-full"
                              :icon="RiAccountCircleLine"
                            >
                              {{ $t("Register") }}
                            </BrandedButton>
                          </li>
                        </ul>
                      </div>
                      <nav
                        class="fr-nav"
                        role="navigation"
                        :aria-label="$t('Main menu')"
                      >
                        <ul class="fr-nav__list">
                          <li
                            v-for="link in menu"
                            :key="`${link.link}-${$route.path}`"
                            class="fr-nav__item"
                          >
                            <NuxtLinkLocale
                              v-if="link.link"
                              class="fr-nav__link"
                              :to="link.link"
                              target="_self"
                              :external="link.external"
                              :aria-current="getAriaCurrent(localePath(link.link))"
                            >
                              {{ link.label }}
                            </NuxtLinkLocale>
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
                                        :as="NuxtLinkLocale"
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
                                    {{ $t('Publish on') }}
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
                                      <NuxtLinkLocale
                                        class="fr-nav__link flex items-center space-x-1"
                                        :to="item.link"
                                      >
                                        <component
                                          :is="item.icon"
                                          class="inline size-4"
                                        />
                                        <span>{{ item.label }}</span>
                                      </NuxtLinkLocale>
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
                title="Retourner à l'accueil de data.gouv.fr"
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
                      type="button"
                      color="primary-softer"
                      :icon="RiLogoutBoxRLine"
                      @click="logout"
                    >
                      {{ $t('Logout') }}
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
                    href="/login"
                    :icon="RiLockLine"
                  >
                    {{ $t("Log in") }}
                  </BrandedButton>
                </li>
                <li>
                  <BrandedButton
                    color="primary-softer"
                    href="/register"
                    :icon="RiAccountCircleLine"
                  >
                    {{ $t("Register") }}
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
          :aria-label="$t('Main menu')"
        >
          <ul class="fr-nav__list">
            <li
              v-for="link in menu"
              :key="`${link.link}-${$route.path}`"
              class="fr-nav__item"
            >
              <NuxtLinkLocale
                v-if="link.link"
                class="fr-nav__link"
                :to="link.link"
                target="_self"
                :external="link.external"
                :aria-current="getAriaCurrent(localePath(link.link))"
              >
                {{ link.label }}
              </NuxtLinkLocale>
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
                        <NuxtLinkLocale
                          class="fr-nav__link"
                          :to="item.link"
                          :external="true"
                        >
                          {{ item.label }}
                        </NuxtLinkLocale>
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
                      {{ $t('Publish on') }}
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
                        <NuxtLinkLocale
                          class="fr-nav__link flex items-center space-x-1"
                          :to="item.link"
                          @click="close()"
                        >
                          <component
                            :is="item.icon"
                            class="size-4 -mt-1"
                          />
                          <span>{{ item.label }}</span>
                        </NuxtLinkLocale>
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
import { RiAccountCircleLine, RiAddLine, RiDatabase2Line, RiGovernmentLine, RiLockLine, RiMenuLine, RiSearchLine, RiRobot2Line, RiLineChartLine, RiServerLine, RiArticleLine, RiSettings3Line, RiLogoutBoxRLine, RiGitPullRequestLine } from '@remixicon/vue'
import { Disclosure, DisclosureButton, DisclosurePanel, Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { NuxtImg, NuxtLinkLocale } from '#components'
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
const url = useRequestURL()

const searchInputId = useId()

const menu = [
  { label: t('Data'), link: '/datasets/' },
  { label: t('API'), link: '/dataservices/' },
  { label: t('Reuses'), link: '/reuses/' },
  { label: t('Organizations'), link: '/organizations/' },
  { label: t('Getting started on {site}', { site: config.public.title }), items: [
    { label: t('What is {site}?', { site: config.public.title }), link: '/pages/about/a-propos_data-gouv/' },
    { label: t('How to publish data?'), link: '/pages/onboarding/producteurs/' },
    { label: t('How to use data?'), link: '/pages/onboarding/reutilisateurs/' },
    { label: t('{site} guides', { site: config.public.title }), link: config.public.guidesUrl, external: true },
  ], external: true },
  { label: t('News'), link: '/posts/' },
  { label: t('Contact us'), link: '/support/' },
]

const publishMenu = [
  { label: t('A dataset'), icon: RiDatabase2Line, link: '/admin/datasets/new/' },
  { label: t('A dataservice'), icon: RiRobot2Line, link: '/admin/dataservices/new/' },
  { label: t('A reuse'), icon: RiLineChartLine, link: '/admin/reuses/new/' },
  { label: t('A harverster'), icon: RiServerLine, link: '/admin/harvesters/new/' },
  { label: t('An organization'), icon: RiGovernmentLine, link: '/admin/organizations/new/' },
  { label: t('A post'), icon: RiArticleLine, link: '/admin/posts/new/', show: isMeAdmin() },
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
  console.log(token.value)
  refreshCookie('token')

  await $api('/fr/logout/', {
    method: 'POST',
  })

  me.value = null
  await navigateTo('/')
}
</script>
