<template>
  <!-- The edit entry point ("Modifier / publier la présentation") lives in the org
       header (parent layout). Here we only render the blocs, plus a "public" toggle
       in the save bar so publishing/unpublishing happens together with the save. -->
  <EditoBlocs
    :blocs
    :editable="canEdit"
    hide-edit-button
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
</template>

<script setup lang="ts">
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

const { blocs, isPublished, saveBlocs } = await useOrganizationBlocs(props.organization)

const isEditing = computed(() => route.query.edit === 'true')

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

function onSave(updatedBlocs: Array<PageBloc>) {
  return saveBlocs(updatedBlocs, wantPublished.value)
}
</script>
