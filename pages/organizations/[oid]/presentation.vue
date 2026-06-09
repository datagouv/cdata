<template>
  <div>
    <div
      v-if="canEdit && !isEditing"
      class="container flex justify-end mb-4"
    >
      <BrandedButton
        color="warning"
        :icon="RiEdit2Line"
        size="xs"
        @click="enterEditMode"
      >
        {{ blocs.length ? $t('Modifier la présentation') : $t('Configurer la présentation') }}
      </BrandedButton>
    </div>
    <EditoBlocs
      :blocs
      editable
      hide-edit-button
      :on-save="saveBlocs"
    />
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, toast, type Organization, type PageBloc } from '@datagouv/components-next'
import { RiEdit2Line } from '@remixicon/vue'
import EditoBlocs from '~/components/Pages/EditoBlocs.vue'
import { updateOrganization } from '~/api/organizations'
import { isUserOrgAdmin, useMaybeMe } from '~/utils/auth'

const props = defineProps<{
  organization: Organization
}>()

const route = useRoute()
const router = useRouter()
const me = useMaybeMe()
const { t } = useTranslation()

const canEdit = computed(() => isUserOrgAdmin(me.value, props.organization))

// `blocs` is excluded from the default organization read mask, so we fetch it
// explicitly here rather than relying on the parent layout's organization.
const url = computed(() => `/api/1/organizations/${props.organization.id}/`)
const { data: org, refresh } = await useAPI<Organization>(url, {
  key: `org-blocs-${props.organization.id}`,
  headers: { 'X-Fields': '{blocs}' },
})

const blocs = computed(() => org.value?.blocs ?? [])
const isEditing = computed(() => route.query.edit === 'true')

// The presentation tab is hidden from non-admins until it has been configured.
// Guard the route itself so a non-admin reaching an empty presentation directly
// (typed URL, stale link) is sent back to the datasets tab instead of a blank page.
if (org.value && !blocs.value.length && !canEdit.value) {
  await navigateTo(`/organizations/${route.params.oid}/datasets`, { replace: true })
}

function enterEditMode() {
  router.push({ query: { ...route.query, edit: 'true' } })
}

async function saveBlocs(updatedBlocs: Array<PageBloc>) {
  try {
    await updateOrganization({ ...props.organization, blocs: updatedBlocs })
    await refresh()
    toast.success(t('Présentation sauvegardée'))
  }
  catch {
    toast.error(t('Erreur lors de la sauvegarde'))
  }
}
</script>
