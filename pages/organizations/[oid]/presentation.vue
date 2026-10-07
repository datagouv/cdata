<!-- The edit/preview switch lives here (segmented control, top right of the tab).
     Publishing happens through the "public" toggle in the composer save bar. -->
<template>
  <div>
    <div
      v-if="canEdit"
      class="container flex justify-end pt-5 mb-4"
    >
      <div
        data-testid="presentation-mode-switch"
        class="flex bg-gray-lower rounded p-1 gap-1"
      >
        <button
          type="button"
          :aria-pressed="isEditing"
          class="flex items-center justify-center gap-2 rounded py-1.5 px-3 text-sm"
          :class="isEditing ? 'bg-white font-bold shadow-sm' : 'text-gray-medium hover:text-gray-title'"
          @click="setEditing(true)"
        >
          <RiEditLine class="size-4" />
          {{ $t('Modifier') }}
        </button>
        <button
          type="button"
          :aria-pressed="!isEditing"
          class="flex items-center justify-center gap-2 rounded py-1.5 px-3 text-sm"
          :class="!isEditing ? 'bg-white font-bold shadow-sm' : 'text-gray-medium hover:text-gray-title'"
          @click="setEditing(false)"
        >
          <RiEyeLine class="size-4" />
          {{ $t('Prévisualiser') }}
        </button>
      </div>
    </div>
    <EditoBlocs
      :blocs
      :editable="canEdit"
      hide-edit-button
      for-organization
      :empty-cta-label="$t('Configurer la présentation')"
      :on-save="onSave"
    >
      <template #save-extra>
        <ToggleSwitch
          v-model="wantPublished"
          :label="$t('Visible par le public')"
          :label-true="$t('Sera publiée')"
          :label-false="$t('Restera en brouillon')"
        />
      </template>
      <template #empty>
        <img
          src="/illustrations/journal.svg"
          class="h-20"
          alt=""
        >
        <p class="fr-text--bold fr-my-3v">
          {{ $t('Personnalisez votre page de présentation') }}
        </p>
        <p class="text-sm text-gray-medium mb-4 max-w-prose text-pretty">
          {{ $t('Ajoutez des blocs de texte, des liens ou des images pour présenter votre organisation. Cette page ne sera visible par le public qu\'une fois configurée.') }}
        </p>
      </template>
    </EditoBlocs>
  </div>
</template>

<script setup lang="ts">
import { RiEyeLine, RiEditLine } from '@remixicon/vue'
import type { Organization, PageBloc } from '@datagouv/components-next'
import EditoBlocs from '~/components/Pages/EditoBlocs.vue'
import ToggleSwitch from '~/components/Form/ToggleSwitch.vue'
import { isUserOrgAdmin, useMaybeMe } from '~/utils/auth'

const props = defineProps<{
  organization: Organization
}>()

const route = useRoute()
const me = useMaybeMe()

const canEdit = computed(() => isUserOrgAdmin(me.value, props.organization))

// Pass a getter, not the prop value: the save spreads the organization, so it
// must read the current props at save time — concurrent changes (banner
// color/position from the banner flyout) replace the object in the parent,
// and a snapshot taken here would send stale values.
const { blocs, isPublished, saveBlocs } = await useOrganizationBlocs(() => props.organization)

const isEditing = computed(() => route.query.edit === 'true')

const router = useRouter()
function setEditing(editing: boolean) {
  router.push({ query: { ...route.query, edit: editing ? 'true' : undefined } })
}

// On an unconfigured presentation: non-admins have nothing to read, so they are
// sent back to the datasets tab (the tab is hidden from them anyway); admins are
// dropped straight into edit mode — there is nothing to preview, so we skip the
// extra "Configurer" click and land them in the composer. This runs once on mount
// (a query-only change does not re-run setup), so cancelling or emptying the page
// later does not bounce the admin back into edit mode.
if (!blocs.value.length && !isEditing.value) {
  if (canEdit.value) {
    await navigateTo({ query: { ...route.query, edit: 'true' } }, { replace: true })
  }
  else {
    await navigateTo(`/organizations/${route.params.oid}/datasets`, { replace: true })
  }
}

// The "public" toggle reflects the current publication state each time the composer
// is opened; saving applies it alongside the blocs in a single request.
const wantPublished = ref(false)
watch(isEditing, (editing) => {
  if (editing) wantPublished.value = isPublished.value
}, { immediate: true })

const emit = defineEmits<{ organizationUpdated: [organization: Organization] }>()

async function onSave(updatedBlocs: Array<PageBloc>) {
  const updated = await saveBlocs(updatedBlocs, wantPublished.value)
  emit('organizationUpdated', updated)
}
</script>
