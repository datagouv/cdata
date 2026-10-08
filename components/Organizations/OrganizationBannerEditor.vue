<template>
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
        :organization="organization"
        :position-override="repositioning ? draftPosition : null"
      >
        <div
          class="flex items-center justify-between"
          :class="{ 'pointer-events-none': repositioning }"
        >
          <slot />
        </div>
      </OrganizationBanner>
      <OrganizationBannerControls
        v-if="organization.permissions.edit"
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
      v-if="flyoutOpen"
      ref="flyoutElement"
      :organization="organization"
      class="absolute right-0 top-12 z-30"
      tabindex="-1"
      @updated="emit('updated', $event)"
      @refresh="emit('refresh')"
      @request-reposition="startReposition"
      @close="closeFlyout"
    />
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import type { Organization } from '@datagouv/components-next'
import OrganizationBanner from '~/components/Organizations/OrganizationBanner.vue'
import OrganizationBannerControls from '~/components/Organizations/OrganizationBannerControls.vue'
import BannerFlyout from '~/components/Organizations/BannerFlyout.vue'
import { deleteOrganizationBanner, updateOrganization } from '~/api/organizations'
import { backgroundCoverHeight, positionFromDrag } from '~/utils/organizationBanner'

const props = defineProps<{
  organization: Organization
}>()

const emit = defineEmits<{
  updated: [organization: Organization]
  refresh: []
}>()

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
    // The DELETE endpoint only removes the image, so the color is cleared
    // too (else a color-only banner is undeletable). Color first: a failed
    // image deletion keeps the image displaying — no data loss.
    if (props.organization.banner_color) {
      emit('updated', await updateOrganization({ ...props.organization, banner_color: null }))
    }
    await deleteOrganizationBanner(props.organization.id)
    emit('refresh')
  }
  catch {
    // Server errors are already toasted by the $api plugin.
  }
}

function startReposition() {
  if (!props.organization.banner_image) return
  closeFlyout()
  draftPosition.value = props.organization.banner_image_position ?? 50
  repositioning.value = true
  imageNaturalSize.value = null
  const image = new Image()
  image.onload = () => {
    imageNaturalSize.value = { width: image.naturalWidth, height: image.naturalHeight }
  }
  image.onerror = () => {
    repositioning.value = false
  }
  image.src = props.organization.banner_image
}

async function saveReposition() {
  savingReposition.value = true
  try {
    emit('updated', await updateOrganization({ ...props.organization, banner_image_position: draftPosition.value }))
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
  const element = event.currentTarget as HTMLElement
  element.setPointerCapture(event.pointerId)
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
</script>
