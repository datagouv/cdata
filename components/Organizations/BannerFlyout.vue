<template>
  <div
    data-testid="banner-flyout"
    class="w-[calc(100vw-32px)] sm:w-[480px] max-w-[480px] bg-white rounded shadow-2xl border border-gray-lower"
  >
    <!-- Segmented control -->
    <SegmentedControl
      v-model="activeTab"
      grow
      class="m-4"
      :options="[
        { value: 'color', label: t('Couleur'), icon: RiPaletteLine },
        { value: 'upload', label: t('Importer'), icon: RiImageLine },
      ]"
    />

    <!-- Couleur -->
    <div
      v-if="activeTab === 'color'"
      class="p-4"
    >
      <p class="text-xs uppercase text-gray-medium mb-2 m-0">
        {{ $t('Couleurs prédéfinies') }}
      </p>
      <div class="grid grid-cols-[repeat(auto-fill,44px)] justify-center gap-2 sm:grid-cols-9 sm:gap-x-0 sm:gap-y-2">
        <button
          v-for="color in DSFR_BANNER_COLORS"
          :key="color.name"
          type="button"
          :aria-label="color.name"
          :title="color.name"
          :aria-pressed="isSelected(color.hex)"
          class="size-11 rounded cursor-pointer border-0 justify-self-center"
          :class="{ 'ring-2 ring-new-primary ring-offset-1': isSelected(color.hex) }"
          :style="{ backgroundColor: color.hex }"
          @click="applyColor(color.hex)"
        />
      </div>
      <hr class="border-gray-lower my-3">
      <p class="text-xs uppercase text-gray-medium mb-2 m-0">
        {{ $t('Couleur personnalisée') }}
      </p>
      <div class="flex gap-2 items-center">
        <label
          class="size-9 rounded border border-gray-default cursor-pointer shrink-0 relative overflow-hidden"
          :style="{ backgroundColor: normalizeHexColor(customColor) ?? '#000091' }"
          :aria-label="$t('Ouvrir le sélecteur de couleur')"
        >
          <input
            v-model="customColor"
            type="color"
            class="absolute inset-0 opacity-0 cursor-pointer"
            @change="commitCustomColor"
          >
        </label>
        <input
          v-model="customColor"
          type="text"
          class="flex-1 h-9 border border-gray-default rounded px-2 text-sm font-mono"
          :aria-label="$t('Code couleur hexadécimal')"
          :placeholder="'#000091'"
          @keydown.enter="commitCustomColor"
          @blur="commitCustomColor"
        >
      </div>
      <p
        v-if="customColorError"
        class="text-sm mt-1 mb-0 text-red-500"
      >
        {{ $t('Format attendu : #000091') }}
      </p>
    </div>

    <!-- Importer -->
    <div
      v-else
      class="p-4"
    >
      <UploadGroup
        :label="$t('Image de bannière')"
        type="drop"
        accept=".jpeg, .jpg, .png"
        :hint-text="$t('Taille max : 4 Mo. Formats acceptés : JPG, JPEG, PNG')"
        :has-error="!!uploadError"
        :error-text="uploadErrorText"
        :is-valid="false"
        @change="onUpload"
      />
      <p class="text-xs text-gray-medium mt-2 mb-0">
        {{ $t('Dimensions minimales : 1200 × 300 px.') }}
      </p>
    </div>

    <!-- Mobile-only actions: the desktop overlay (hover) already offers them,
         but touch devices have no hover and only reach this flyout. -->
    <div class="sm:hidden flex gap-2 justify-end px-4 pb-4">
      <BrandedButton
        v-if="organization.banner_image"
        size="xs"
        @click="$emit('requestReposition')"
      >
        {{ $t('Repositionner') }}
      </BrandedButton>
      <BrandedButton
        v-if="hasCustomBanner"
        size="xs"
        color="danger"
        :loading="pending"
        @click="removeBanner"
      >
        {{ $t('Supprimer') }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RiImageLine, RiPaletteLine } from '@remixicon/vue'
import { BrandedButton, SegmentedControl, toast, type Organization } from '@datagouv/components-next'
import { deleteOrganizationBanner, updateOrganizationBannerColor, uploadOrganizationBanner } from '~/api/organizations'
import UploadGroup from '~/components/UploadGroup/UploadGroup.vue'
import { DSFR_BANNER_COLORS, normalizeHexColor, validateBannerFile } from '~/utils/organizationBanner'

const props = defineProps<{
  organization: Organization
}>()

const emit = defineEmits<{
  updated: [organization: Organization]
  refresh: []
  requestReposition: []
  close: []
}>()

const { t } = useTranslation()

// Open on the tab matching the current banner type (spec §2).
const activeTab = ref(props.organization.banner_image ? 'upload' : 'color')
const pending = ref(false)
const selectedColor = ref<string | null>(props.organization.banner_color ?? null)
const customColor = ref(props.organization.banner_color ?? '#000091')
const customColorError = ref(false)
const uploadError = ref<null | 'format' | 'size' | 'dimensions'>(null)

const hasCustomBanner = computed(() => !!(props.organization.banner_image || props.organization.banner_color))

function isSelected(hex: string) {
  return selectedColor.value === hex
}

async function applyColor(color: string) {
  if (pending.value) return
  customColorError.value = false
  pending.value = true
  try {
    // Color/image are mutually exclusive (spec §2): drop the image first.
    if (props.organization.banner_image) {
      await deleteOrganizationBanner(props.organization.id)
    }
    const updated = await updateOrganizationBannerColor(props.organization.id, color)
    selectedColor.value = color
    customColor.value = color
    uploadError.value = null
    emit('updated', updated)
  }
  catch {
    // Server errors are already toasted by the $api plugin.
  }
  finally {
    pending.value = false
  }
}

function commitCustomColor() {
  const normalized = normalizeHexColor(customColor.value)
  if (!normalized) {
    customColorError.value = true
    return
  }
  customColorError.value = false
  applyColor(normalized)
}

const uploadErrorMessages = computed(() => ({
  format: t('Format non pris en charge. Formats acceptés : JPG, JPEG, PNG.'),
  size: t('Image trop lourde. Taille maximale : 4 Mo.'),
  dimensions: t('Image trop petite. Dimensions minimales : 1200 × 300 px.'),
}))

const uploadErrorText = computed(() => (uploadError.value ? uploadErrorMessages.value[uploadError.value] : ''))

async function onUpload(files: Array<File>) {
  const file = files[0]
  if (!file || pending.value) return
  pending.value = true
  uploadError.value = await validateBannerFile(file)
  if (uploadError.value) {
    pending.value = false
    return
  }
  try {
    await uploadOrganizationBanner(props.organization.id, file)
  }
  catch (error) {
    // Server rejection: the $api plugin already surfaces the server error
    // detail as a toast; only the client-side checks use inline messages.
    const { status, statusCode } = error as { status?: number, statusCode?: number }
    uploadError.value = (status ?? statusCode) === 413 ? 'size' : 'format'
    pending.value = false
    return
  }
  selectedColor.value = null
  uploadError.value = null
  if (props.organization.banner_color) {
    try {
      emit('updated', await updateOrganizationBannerColor(props.organization.id, null))
      pending.value = false
      return
    }
    catch {
      toast.error(t('L\'image a été envoyée, mais la couleur précédente n\'a pas pu être retirée.'))
    }
  }
  pending.value = false
  emit('refresh')
}

// No close button in the panel (slim design): Escape closes it, and the parent
// already closes on outside click.
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

async function removeBanner() {
  if (pending.value) return
  pending.value = true
  try {
    await deleteOrganizationBanner(props.organization.id)
    if (props.organization.banner_color) {
      await updateOrganizationBannerColor(props.organization.id, null)
    }
    selectedColor.value = null
    customColor.value = '#000091'
    uploadError.value = null
    emit('refresh')
  }
  catch {
    // Server errors are already toasted by the $api plugin.
  }
  finally {
    pending.value = false
  }
}
</script>
