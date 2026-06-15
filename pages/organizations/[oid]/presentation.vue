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
      :editable="canEdit"
      hide-edit-button
      :on-save="saveBlocs"
    />
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, type Organization } from '@datagouv/components-next'
import { RiEdit2Line } from '@remixicon/vue'
import EditoBlocs from '~/components/Pages/EditoBlocs.vue'
import { isUserOrgAdmin, useMaybeMe } from '~/utils/auth'

const props = defineProps<{
  organization: Organization
}>()

const route = useRoute()
const router = useRouter()
const me = useMaybeMe()

const canEdit = computed(() => isUserOrgAdmin(me.value, props.organization))

const { blocs, saveBlocs } = await useOrganizationBlocs(props.organization)

const isEditing = computed(() => route.query.edit === 'true')

// The presentation tab is hidden from non-admins until it has been configured.
// Guard the route itself so a non-admin reaching an empty presentation directly
// (typed URL, stale link) is sent back to the datasets tab instead of a blank page.
if (!blocs.value.length && !canEdit.value) {
  await navigateTo(`/organizations/${route.params.oid}/datasets`, { replace: true })
}

function enterEditMode() {
  router.push({ query: { ...route.query, edit: 'true' } })
}
</script>
