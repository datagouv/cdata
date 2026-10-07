<!-- eslint-disable vue/no-v-html -->
<template>
  <div>
    <div class="relative group">
      <div
        ref="bannerElement"
        class="relative"
        :class="{ 'cursor-grab active:cursor-grabbing select-none touch-none': repositioning }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <OrganizationBanner
          v-if="organization"
          :organization="organization"
          :position-override="repositioning ? draftPosition : null"
        >
          <div
            class="flex items-center justify-between"
            :class="{ 'pointer-events-none': repositioning }"
          >
            <Breadcrumb>
              <BreadcrumbItem to="/">
                {{ $t('Accueil') }}
              </BreadcrumbItem>
              <BreadcrumbItem to="/organizations">
                {{ $t('Organisations') }}
              </BreadcrumbItem>
              <BreadcrumbItem>
                {{ organization.name }}
              </BreadcrumbItem>
            </Breadcrumb>
            <div class="flex gap-3 items-center">
              <ReportModal
                v-if="!isOrganizationCertified(organization)"
                :subject="{ id: organization.id, class: 'Organization' }"
              />
            </div>
          </div>
        </OrganizationBanner>
        <OrganizationBannerControls
          v-if="organization && organization.permissions.edit"
          :organization="organization"
          :repositioning="repositioning"
          :saving="savingReposition"
          :position="draftPosition"
          @open-flyout="openFlyout"
          @start-reposition="startReposition"
          @save-reposition="saveReposition"
          @cancel-reposition="cancelReposition"
          @delete-banner="deleteBanner"
        />
      </div>
      <BannerFlyout
        v-if="flyoutOpen && organization"
        ref="flyoutElement"
        :organization="organization"
        class="absolute right-0 top-full z-30 mt-2"
        tabindex="-1"
        @updated="onBannerUpdated"
        @refresh="onBannerRefresh"
        @request-reposition="startReposition"
        @close="closeFlyout"
      />
    </div>
    <LoadingBlock
      v-if="organization"
      v-slot="{ data: organization }"
      :status
      :data="organization"
    >
      <div class="container relative">
        <div class="bg-white p-1 rounded-sm border border-gray-default object-contain size-20 -mb-10 -mt-10 relative z-1">
          <OrganizationLogo
            :organization
            size-class="size-full"
          />
        </div>
      </div>
      <div class="bg-white">
        <div class="container pt-14 pb-4 sm:pb-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p
                v-if="organization.deleted"
                class="fr-badge mb-2 flex gap-1 items-center"
              >
                <RiDeleteBinLine class="size-3.5" />
                {{ $t('Supprimée') }}
              </p>
              <h1 class="leading-[1.2] font-extrabold text-gray-title mb-2.5">
                <OrganizationNameWithCertificate
                  :certifier="config.public.title"
                  :organization
                  :show-acronym="true"
                  :show-type="false"
                  color-class="text-gray-title"
                  size="xl"
                />
              </h1>
            </div>
            <!-- Below the banner (interim placement, pending PO feedback) so the
                 banner actions row stays limited to the report button. -->
            <EditButton
              v-if="organization.permissions.edit"
              :id="organization.id"
              type="organizations"
            />
          </div>
          <OwnerType
            :type
            size="base"
            color="gray"
            class="text-sm sm:text-base text-gray-medium"
          />
          <ReadMore
            v-if="organization.description"
            class="mt-2.5 text-sm text-new-gray-medium leading-6"
            :wanted-height="100"
          >
            <MarkdownViewer
              :content="organization.description"
              :min-heading="3"
            />
          </ReadMore>
        </div>
        <FullPageTabs
          :links="tabLinks"
        >
          <form
            class="flex items-center"
            @submit.prevent="submitSearch"
          >
            <label
              for="org-search"
              class="sr-only"
            >
              {{ $t('Rechercher dans l\'organisation') }}
            </label>
            <div class="flex items-center h-10 w-60 sm:w-80">
              <RiSearchLine class="ml-3 shrink-0 size-4 text-new-primary" />
              <input
                id="org-search"
                v-model="searchQuery"
                type="search"
                class="bg-transparent flex-1 h-full pl-2 pr-6 text-sm sm:text-base placeholder:text-gray-medium outline-none"
                :placeholder="$t('Rechercher dans l\'organisation')"
              >
            </div>
          </form>
        </FullPageTabs>
      </div>
      <div :class="{ 'bg-white pt-5 pb-8 lg:pb-24': !isPresentationTab }">
        <NuxtPage
          v-if="organization"
          :class="{ container: !isPresentationTab }"
          :organization
          @organization-updated="onOrganizationUpdated"
        />
      </div>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import { isOrganizationCertified, LoadingBlock, MarkdownViewer, OrganizationNameWithCertificate, OwnerType, ReadMore, getOrganizationType, type Organization, OrganizationLogo } from '@datagouv/components-next'
import { RiDeleteBinLine, RiSearchLine } from '@remixicon/vue'
import { onClickOutside, useTimeoutFn } from '@vueuse/core'
import EditButton from '~/components/Buttons/EditButton.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import BannerFlyout from '~/components/Organizations/BannerFlyout.vue'
import OrganizationBanner from '~/components/Organizations/OrganizationBanner.vue'
import OrganizationBannerControls from '~/components/Organizations/OrganizationBannerControls.vue'
import ReportModal from '~/components/Spam/ReportModal.vue'
import { deleteOrganizationBanner, updateOrganizationBannerColor, updateOrganizationBannerPosition } from '~/api/organizations'
import { isUserOrgAdmin, useMaybeMe } from '~/utils/auth'
import { backgroundCoverHeight, positionFromDrag } from '~/utils/organizationBanner'
import { keepScrollWithinPage } from '~/utils/scroll'

definePageMeta({
  scrollToTop: keepScrollWithinPage,
})

const config = useRuntimeConfig()
const route = useRoute()
const me = useMaybeMe()
const { t } = useTranslation()

const url = computed(() => `/api/1/organizations/${route.params.oid}/`)
const { data: organization, status, refresh } = await useAPI<Organization>(url, { redirectOn404: true, redirectOnSlug: 'oid' })

// A presentation is offered to the public only once published. The publication
// date lives in the default mask, so we read it straight from the organization
// instead of fetching the (heavy) blocs here — those are lazy-loaded on the
// presentation page itself.
const hasPresentation = computed(() => isOrganizationPresentationPublished(organization.value?.presentation_blocs_published_at))
const canEditPresentation = computed(() => isUserOrgAdmin(me.value, organization.value))
// Hidden from non-admins until configured; always available to org admins so they
// can create it.
const showPresentationTab = computed(() => hasPresentation.value || canEditPresentation.value)
const isPresentationTab = computed(() => route.path.endsWith('/presentation'))

// The presentation page saves the org on its own fetch and hands back the saved
// version; swap it in so the header CTA, tabs… update without a reload.
function onOrganizationUpdated(updated: Organization) {
  organization.value = updated
}

// --- Organization banner (data.gouv.fr#2049) ---
const flyoutOpen = ref(false)
const flyoutElement = ref<InstanceType<typeof BannerFlyout> | null>(null)
const elementFocusedBeforeFlyout = ref<Element | null>(null)
const repositioning = ref(false)
const savingReposition = ref(false)
const draftPosition = ref(50)
const bannerElement = ref<HTMLElement | null>(null)
const dragStartY = ref(0)
const dragStartPosition = ref(50)
const dragging = ref(false)
const imageNaturalSize = ref<{ width: number, height: number } | null>(null)

function onBannerUpdated(updated: Organization) {
  organization.value = updated
}

async function onBannerRefresh() {
  await refresh()
}

function openFlyout() {
  // Remember where focus was so closeFlyout can restore it (a11y).
  elementFocusedBeforeFlyout.value = document.activeElement
  flyoutOpen.value = true
  nextTick(() => {
    (flyoutElement.value?.$el as HTMLElement | undefined)?.focus()
  })
}

function closeFlyout() {
  flyoutOpen.value = false
  const previous = elementFocusedBeforeFlyout.value
  if (previous instanceof HTMLElement && document.contains(previous)) {
    previous.focus()
  }
  elementFocusedBeforeFlyout.value = null
}

// --- Flyout keyboard handling: Esc closes, Tab cycles focus inside the flyout ---
function onFlyoutKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeFlyout()
    return
  }
  if (event.key !== 'Tab') return
  const root = flyoutElement.value?.$el as HTMLElement | undefined
  if (!root) return
  const focusable = Array.from(root.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'))
    .filter(el => el.offsetParent !== null)
  if (!focusable.length) {
    event.preventDefault()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

// While the flyout is open: watch for outside clicks (registered after the
// opening click has settled) and keep Tab focus trapped inside the flyout.
const stopClickOutside = ref<(() => void) | null>(null)
function teardownFlyoutListeners() {
  stopClickOutside.value?.()
  stopClickOutside.value = null
  document.removeEventListener('keydown', onFlyoutKeydown)
}
watch(flyoutOpen, async (open) => {
  if (open) {
    document.addEventListener('keydown', onFlyoutKeydown)
    // Defer registration past the opening click, or it would close immediately.
    await nextTick()
    if (flyoutElement.value) {
      stopClickOutside.value = onClickOutside(() => flyoutElement.value?.$el as HTMLElement | undefined, closeFlyout)
    }
  }
  else {
    teardownFlyoutListeners()
  }
})
onBeforeUnmount(teardownFlyoutListeners)

async function deleteBanner() {
  try {
    await deleteOrganizationBanner(organization.value!.id)
    if (organization.value?.banner_color) {
      organization.value = await updateOrganizationBannerColor(organization.value.id, null)
    }
    else {
      await refresh()
    }
  }
  catch {
    // Server errors are already toasted by the $api plugin.
  }
}

function startReposition() {
  if (!organization.value?.banner_image) return
  closeFlyout()
  draftPosition.value = organization.value.banner_image_position ?? 50
  repositioning.value = true
  imageNaturalSize.value = null
  const image = new Image()
  image.onload = () => {
    imageNaturalSize.value = { width: image.naturalWidth, height: image.naturalHeight }
  }
  image.onerror = () => {
    repositioning.value = false
  }
  image.src = organization.value.banner_image
}

async function saveReposition() {
  savingReposition.value = true
  try {
    organization.value = await updateOrganizationBannerPosition(organization.value!.id, draftPosition.value)
    repositioning.value = false
  }
  catch {
    // Server errors are already toasted by the $api plugin.
  }
  finally {
    savingReposition.value = false
  }
}

function cancelReposition() {
  repositioning.value = false
}

function onPointerDown(event: PointerEvent) {
  if (!repositioning.value) return
  // Let the Enregistrer/Annuler buttons work: only the banner surface drags.
  if ((event.target as HTMLElement).closest('button')) return
  dragging.value = true
  dragStartY.value = event.clientY
  dragStartPosition.value = draftPosition.value
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerUp() {
  dragging.value = false
}

function onPointerMove(event: PointerEvent) {
  if (!repositioning.value) return
  if (!dragging.value) return
  const element = bannerElement.value
  const size = imageNaturalSize.value
  if (!element || !size) return
  const overflow = Math.max(0, backgroundCoverHeight(element.clientWidth, size.width, size.height) - element.clientHeight)
  draftPosition.value = positionFromDrag(dragStartPosition.value, event.clientY - dragStartY.value, overflow)
}

function onRepositionKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    cancelReposition()
  }
}
watch(repositioning, (active) => {
  if (active) {
    document.addEventListener('keydown', onRepositionKeydown)
  }
  else {
    document.removeEventListener('keydown', onRepositionKeydown)
  }
})

const tabLinks = computed(() => {
  const oid = route.params.oid
  return [
    ...(showPresentationTab.value ? [{ label: t('Présentation'), href: `/organizations/${oid}/presentation` }] : []),
    { label: t('Jeux de données'), href: `/organizations/${oid}/datasets`, count: organization.value?.metrics.datasets },
    { label: t('API'), href: `/organizations/${oid}/dataservices`, count: organization.value?.metrics.dataservices },
    { label: t('Réutilisations'), href: `/organizations/${oid}/reuses`, count: organization.value?.metrics.reuses },
    { label: t('Informations'), href: `/organizations/${oid}/information` },
  ]
})

const title = computed(() => `Organisation - ${organization.value?.name} | ${config.public.title}`)
const robots = computed(() => organization.value && !organization.value.metrics.dataservices && !organization.value.metrics.datasets && !organization.value.metrics.reuses ? 'noindex, nofollow' : 'all')

useSeoMeta({
  title,
  robots,
})
defineOgImage('ObjectPage.takumi', {
  orgName: organization.value?.name,
  orgLogo: organization.value?.logo_thumbnail ?? null,
  datasets: organization.value?.metrics?.datasets ?? 0,
  dataservices: organization.value?.metrics?.dataservices ?? 0,
  reuses: organization.value?.metrics?.reuses ?? 0,
})
await useJsonLd('organization', route.params.oid as string)

const type = computed(() => organization.value ? getOrganizationType(organization.value) : 'other')

const searchQuery = ref((route.query.q as string) || '')
const searchPath = computed(() => `/organizations/${route.params.oid}/search`)

const currentSearchType = computed(() => {
  const path = route.path
  if (path.endsWith('/dataservices')) return 'dataservices'
  if (path.endsWith('/reuses')) return 'reuses'
  return 'datasets'
})

function submitSearch() {
  const q = searchQuery.value.trim()
  if (q) {
    navigateTo({ path: searchPath.value, query: { q, type: currentSearchType.value } })
  }
}

// Debounce typing-driven navigation to /search, but navigate immediately when
// clearing — debouncing a clear adds perceived latency for nothing, and the
// explicit cancel() avoids a latent bug where typing "foo" then clearing
// within 300ms would still fire the search navigation after the clear.
const { start: scheduleSearch, stop: cancelSearch } = useTimeoutFn(() => {
  navigateTo({ path: searchPath.value, query: { q: searchQuery.value.trim(), type: currentSearchType.value } })
}, 300, { immediate: false })

watch(searchQuery, (value) => {
  cancelSearch()
  if (value.trim()) {
    scheduleSearch()
  }
  else if (route.path.endsWith('/search')) {
    navigateTo({ path: `/organizations/${route.params.oid}` })
  }
})
</script>
