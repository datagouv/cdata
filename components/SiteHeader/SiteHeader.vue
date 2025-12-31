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
                <p
                  v-if="appConfig.isFrenchGovernment"
                  class="fr-logo"
                >
                  République <br>Française
                </p>
                <p v-else>
                  Add Your logo
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
                      class="flex-none w-10 h-10 text-new-primary inline-flex items-center justify-center"
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
                      class="flex-none w-10 h-10 text-new-primary border-solid border border-gray-300 inline-flex items-center justify-center"
                      :title="$t('Menu')"
                      v-bind="attrs"
                      v-on="listeners"
                    >
                      <RiMenuLine class="size-6" />
                    </button>
                  </template>
                  <template #default="{ close }">
                    <div>
                      <div class="fr-container fr-header__menu-links">
                        <ul
                          v-if="me"
                          class="list-none"
                        >
                          <li>
                            <BrandedButton
                              :href="me.page"
                              color="tertiary"
                              :icon="NuxtImg"
                              :icon-attrs="{
                                'src': getUserAvatar(me, 24),
                                'loading': 'lazy',
                                'alt': '',
                                'class': 'rounded-full',
                                'data-testid': 'user-avatar',
                              }"
                              @click="close"
                            >
                              {{ me.first_name }} {{ me.last_name }}
                            </BrandedButton>
                          </li>
                          <li>
                            <BrandedButton
                              href="/admin"
                              color="tertiary"
                              :icon="RiSettings3Line"
                              @click="close"
                            >
                              {{ $t("Administration") }}
                            </BrandedButton>
                          </li>
                          <li>
                            <BrandedButton
                              v-if="config.public.enableCdataSecurityViews"
                              type="button"
                              :icon="RiLogoutBoxRLine"
                              color="tertiary"
                              @click="async () => { (await logout()); close() }"
                            >
                              {{ $t('Se déconnecter') }}
                            </BrandedButton>
                            <BrandedButton
                              v-else
                              :href="`${config.public.apiBase}/logout`"
                              :icon="RiLogoutBoxRLine"
                              :external="true"
                              color="tertiary"
                              @click="close"
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
                              color="tertiary"
                              size="lg"
                              :icon="RiLockLine"
                              class="w-full"
                              @click="close"
                            >
                              {{ $t("Se connecter") }}
                            </BrandedButton>
                          </li>
                          <li>
                            <BrandedButton
                              color="tertiary"
                              size="lg"
                              :href="{ path: '/register', query: { next: route.fullPath } }"
                              class="w-full"
                              :icon="RiAccountCircleLine"
                              @click="close"
                            >
                              {{ $t("S'enregistrer") }}
                            </BrandedButton>
                          </li>
                        </ul>
                      </div>
                      <nav
                        class="fr-container fr-nav border-t border-gray-default"
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
                              :aria-current="getAriaCurrent(link.link)"
                              @click="close"
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
                                        @click="close"
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
                                    <LogoAsText />
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
                <LogoImage class="mt-2 lg:mt-0 h-12" />
              </a>
            </div>
          </div>
          <div class="fr-header__tools">
            <div class="fr-header__tools-links">
              <ClientOnly v-if="me">
                <ul class="list-none flex space-x-7">
                  <li class="flex gap-2 items-center">
                    <BrandedButton
                      :href="me.page"
                      color="tertiary"
                      :icon="NuxtImg"
                      :icon-attrs="{
                        'src': getUserAvatar(me, 24),
                        'loading': 'lazy',
                        'alt': '',
                        'class': 'rounded-full',
                        'data-testid': 'user-avatar',
                      }"
                    >
                      {{ me.first_name }} {{ me.last_name }}
                    </BrandedButton>
                    <Toggletip
                      v-if="pendingNotifications"
                      :button-props="{
                        class: `px-1 text-xs h-5 gap-1 font-bold rounded-sm ${pendingNotifications.total ? 'text-danger bg-danger-lightest' : 'text-primary'}`,
                        title: $t('Voir les notifications - {new} nouvelle | Voir les notifications - {new} nouvelles', { new: pendingNotifications.total }),
                      }"
                      no-margin
                      :styled-button="false"
                    >
                      <RiInbox2Line
                        class="size-3"
                        aria-hidden="true"
                      />
                      {{ pendingNotifications.total }}
                      <template #toggletip="{ close }">
                        <div class="flex justify-between border-b border-gray-default">
                          <h5 class="fr-text--sm fr-my-0 fr-p-2v">
                            {{ t("Notifications") }}
                          </h5>
                          <button
                            type="button"
                            :title="t('Fermer')"
                            class="border-l border-gray-default close-button flex items-center justify-center"
                            @click="close"
                          >
                            <RiCloseLine class="size-5" />
                          </button>
                        </div>
                        <NotificationsList
                          v-if="notificationsCombinedList.length"
                          :notifications="notificationsCombinedList"
                        />
                        <template v-else>
                          <div class="py-5 px-16 flex flex-col items-center text-center">
                            <NuxtImg
                              class="w-6"
                              src="/illustrations/coffee.svg"
                              alt=""
                            />
                            <p class="m-0 font-bold text-xs">
                              {{ $t(`Vous n'avez pas encore de notifications`) }}
                            </p>
                            <p class="m-0 text-xs">
                              {{ $t('Le système de notifications est actuellement en cours de refonte.') }}
                            </p>
                          </div>
                        </template>
                        <button
                          v-if="nextPage"
                          type="button"
                          class="w-full bg-datagouv hover:bg-datagouv-dark text-white p-2 flex items-center justify-center"
                          :disabled="isLoading"
                          @click="loadMoreNotifications"
                        >
                          <AnimatedLoader
                            v-if="isLoading"
                            class="size-5"
                          />
                          <RiAddLine
                            v-else
                            class="size-5"
                          />
                          {{ t('Charger plus de notifications') }}
                        </button>
                      </template>
                    </Toggletip>
                  </li>
                  <li>
                    <BrandedButton
                      href="/admin"
                      color="tertiary"
                      :icon="RiSettings3Line"
                    >
                      {{ $t("Administration") }}
                    </BrandedButton>
                  </li>
                  <li>
                    <BrandedButton
                      v-if="config.public.enableCdataSecurityViews"
                      type="button"
                      color="tertiary"
                      :icon="RiLogoutBoxRLine"
                      @click="logout"
                    >
                      {{ $t('Se déconnecter') }}
                    </BrandedButton>
                    <BrandedButton
                      v-else
                      :href="`${config.public.apiBase}/logout`"
                      color="tertiary"
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
                    color="tertiary"
                    :href="{ path: '/login', query: { next: route.fullPath } }"
                    :icon="RiLockLine"
                  >
                    {{ $t("Se connecter") }}
                  </BrandedButton>
                </li>
                <li>
                  <BrandedButton
                    color="tertiary"
                    :href="{ path: '/register', query: { next: route.fullPath } }"
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
                :aria-current="getAriaCurrent(link.link)"
              >
                {{ link.label }}
              </CdataLink>
              <ClientOnly v-else-if="link.items">
                <Menu>
                  <MenuButton
                    class="fr-nav__btn"
                  >
                    {{ link.label }}
                  </MenuButton>
                  <MenuItems
                    class="fr-menu"
                  >
                    <ul class="fr-menu__list">
                      <li
                        v-for="item in link.items"
                        :key="item.label"
                      >
                        <MenuItem>
                          <CdataLink
                            class="fr-nav__link"
                            :to="item.link"
                            :external="true"
                          >
                            {{ item.label }}
                          </CdataLink>
                        </MenuItem>
                      </li>
                    </ul>
                  </MenuItems>
                </Menu>
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
                      <LogoAsText />
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
import { NuxtImg } from '#components'
import { AnimatedLoader, BrandedButton, Toggletip, useGetUserAvatar, toast } from '@datagouv/components-next'
import { RiAccountCircleLine, RiAddLine, RiDatabase2Line, RiInbox2Line, RiLockLine, RiMenuLine, RiSearchLine, RiRobot2Line, RiLineChartLine, RiServerLine, RiArticleLine, RiSettings3Line, RiLogoutBoxRLine, RiBuilding2Line, RiCloseLine } from '@remixicon/vue'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import CdataLink from '../CdataLink.vue'
import LogoAsText from '../LogoAsText.vue'
import LogoImage from '../LogoImage.vue'
import { useNotifications } from '~/composables/useNotifications.client'
import { useLogout, useMaybeMe } from '~/utils/auth'

defineProps<{
  fluid?: boolean
}>()

const getUserAvatar = useGetUserAvatar()
const { t } = useTranslation()
const config = useRuntimeConfig()
const appConfig = useAppConfig()
const me = useMaybeMe()
const currentRoute = useRoute()
const router = useRouter()
const route = useRoute()
const { isLoading } = useLoadingIndicator()
const { refreshNotifications, loadMoreNotifications, pendingNotifications, nextPage, notificationsCombinedList } = useNotifications()

const menu = [
  { label: t('Données'), link: '/datasets' },
  { label: t('API'), link: '/dataservices' },
  { label: t('Réutilisations'), link: '/reuses' },
  { label: t('Organisations'), link: '/organizations' },
  { label: t('Démarrer sur {site}', { site: config.public.title }), items: [
    { label: t(`Qu'est-ce que {site} ?`, { site: config.public.title }), link: config.public.homepageAboutUs },
    { label: t('Comment publier des données ?'), link: config.public.homepagePublishDatasetOnboarding },
    { label: t('Comment utiliser des données ?'), link: config.public.homepagePublishReuseOnboarding },
    { label: t('Les guides {site}', { site: config.public.title }), link: config.public.guidesUrl, external: true },
    { label: t('Nos produits'), link: '/products' },
  ], external: true },
  { label: t('Nouveautés'), link: '/posts' },
  { label: t('Nous écrire'), link: '/support' },
]

const publishMenu = [
  { label: t('Un jeu de données'), icon: RiDatabase2Line, link: '/admin/datasets/new' },
  { label: t('Une API'), icon: RiRobot2Line, link: '/admin/dataservices/new' },
  { label: t('Une réutilisation'), icon: RiLineChartLine, link: '/admin/reuses/new' },
  { label: t('Un moissonneur'), icon: RiServerLine, link: '/admin/harvesters/new' },
  { label: t('Une organisation'), icon: RiBuilding2Line, link: '/admin/organizations/new' },
  { label: t('Un article'), icon: RiArticleLine, link: '/admin/posts/new', show: isMeAdmin() },
]

const filteredPublishMenu = computed(() => publishMenu.filter(item => !('show' in item) || item.show))

function getAriaCurrent(link: string) {
  if (currentRoute.path === link) {
    return 'page'
  }
  const routesInPath = router.getRoutes().map(route => route.path).filter(path => currentRoute.path.startsWith(path))
  return routesInPath.includes(link)
}

const doLogout = useLogout()
const logout = async () => {
  doLogout()
  toast.success(t('Vous avez été déconnecté.'))
}

onMounted(() => {
  // TODO: remove this logic when we don't rely on udata flash messages
  // following https://github.com/opendatateam/udata/pull/3348
  const FLASH_MESSAGES: Record<string, { type: 'success' | 'error', text: string }> = {
    logout: { type: 'success', text: t('Vous êtes maintenant déconnecté.') },
    connected: { type: 'success', text: t('Vous êtes maintenant connecté.') },
    change_email: { type: 'success', text: t('Merci. Les instructions de confirmation pour changer votre adresse email ont été envoyées à l\'adresse mail cible.') },
    post_confirm: { type: 'success', text: t('Votre adresse email est maintenant confirmée. Vous êtes maintenant connecté.') },
    change_email_confirmed: { type: 'success', text: t('Votre nouvelle adresse email est maintenant confirmée.') },
    change_email_expired: { type: 'error', text: t('Le code de vérification de votre adresse email a expiré, un nouveau mail vous a été envoyé.') },
    change_email_invalid: { type: 'error', text: t('Le code de vérification de votre adresse email est incorrect.') },
    change_email_already_taken: { type: 'error', text: t('Cette adresse email est déjà utilisée par un autre compte. Votre adresse email n\'a pas été modifiée.') },
  }

  if (route.query.flash) {
    let message = null as { type: 'success' | 'error' | 'info', text: string } | null
    if (route.query.flash === 'confirm_error') {
      if (route.query.info) {
        message = { type: 'info', text: route.query.info as string }
      }
      if (route.query.error) {
        message = { type: 'error', text: route.query.error as string }
      }
    }
    else {
      message = FLASH_MESSAGES[route.query.flash as string] || null
    }

    if (message) {
      toast[message.type](message.text)
    }
  }
})

watch(me, () => {
  if (me.value) {
    refreshNotifications()
  }
}, { immediate: true })
</script>
