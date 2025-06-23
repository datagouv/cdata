<template>
  <div>
    <h2
      v-if="form"
      class="text-sm font-bold uppercase mb-5"
    >
      {{ t("Edit profile") }}
    </h2>
    <AdminLoader v-if="isLoading && !organization" />
    <DescribeOrganizationFrom
      v-if="organization"
      ref="form"
      v-model="organizationForm"
      type="update"
      :submit-label="$t('Save')"
      :errors="errors"
      :show-legend="false"
      :show-well="false"
      @submit="updateCurrentOrganization"
    >
      <template #top>
        <BannerAction
          v-if="isMeAdmin() && organization.deleted"
          class="mb-4"
          type="warning"
          :title="$t(`Restaurer l'organisation`)"
        >
          {{ $t("Sans restauration, l'organisation sera définitivement supprimée dans la nuit.") }}

          <template #button>
            <BrandedButton
              :icon="RiArrowGoBackLine"
              :loading="isLoading"
              @click="restoreOrganization"
            >
              {{ $t('Restaurer') }}
            </BrandedButton>
          </template>
        </BannerAction>
      </template>
      <template #default>
        <BannerAction
          v-if="!organization.deleted"
          class="mt-12"
          type="danger"
          :title="$t('Delete the organization')"
        >
          {{ t("Be careful, this action can't be reverse.") }}
          <template #button>
            <ModalWithButton
              :title="t('Are you sure you want to delete this organization ?')"
              size="lg"
            >
              <template #button="{ attrs, listeners }">
                <BrandedButton
                  :loading="isLoading"
                  color="danger"
                  :icon="RiDeleteBin6Line"
                  v-bind="attrs"
                  v-on="listeners"
                >
                  {{ t('Delete') }}
                </BrandedButton>
              </template>
              <template #default>
                <p class="fr-text--bold">
                  {{ t("This action can't be reverse.") }}
                </p>
                <p>{{ t("All content published with this organization will stay online, with the same URL but in an anonymous form, i.e. without being linked to a data producer.") }}</p>
                <p>{{ t("If you want to delete your published content too, start by deleting the contents before deleting your account.") }}</p>
              </template>
              <template #footer>
                <div class="flex-1 fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-lg fr-btns-group--icon-left">
                  <button
                    class="fr-btn fr-btn--secondary rounded-full !text-red-600 !border border-solid !border-red-600 !shadow-none"
                    role="button"
                    :loading="isLoading"
                    @click="deleteCurrentOrganization"
                  >
                    {{ t("Delete the organization") }}
                  </button>
                </div>
              </template>
            </ModalWithButton>
          </template>
        </BannerAction>
      </template>
    </DescribeOrganizationFrom>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RiArrowGoBackLine, RiDeleteBin6Line } from '@remixicon/vue'
import { BannerAction, BrandedButton } from '@datagouv/components-next'
import type { Organization, Badge } from '@datagouv/components-next'
import AdminLoader from '~/components/AdminLoader/AdminLoader.vue'
import DescribeOrganizationFrom from '~/components/Organization/New/Step2DescribeOrganization.vue'
import { updateOrganization, updateOrganizationBadges, uploadLogo } from '~/api/organizations'

const props = defineProps<{
  organization: Organization
}>()
const emit = defineEmits<{
  refresh: []
}>()

const { t } = useI18n()
const { toast } = useToast()
const { $api } = useNuxtApp()
const { start, finish, isLoading } = useLoadingIndicator()
const localPath = useLocalePath()

const form = ref<InstanceType<typeof DescribeOrganizationFrom> | null>(null)

const errors = ref([])
const organizationForm = ref<Organization>({ ...props.organization })
watchEffect(() => {
  organizationForm.value = props.organization
})

async function deleteCurrentOrganization() {
  if (props.organization) {
    start()
    await $api(`api/1/organizations/${props.organization.id}/`, { method: 'DELETE' })
    finish()
    if (isMeAdmin()) {
      emit('refresh')
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }
    else {
      reloadNuxtApp({
        path: localPath('/admin/me/profile'),
      })
    }
  }
}

async function restoreOrganization() {
  start()
  try {
    await updateOrganization({
      ...organizationForm.value,
      deleted: null,
    })
    toast.success(t('Organisation restaurée !'))
    emit('refresh')

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}

async function updateCurrentOrganization(logo_file: File | null, newBadges: Array<Badge> | null) {
  start()
  try {
    await updateOrganization(organizationForm.value)
    if (newBadges && props.organization) {
      await updateOrganizationBadges(props.organization, newBadges)
    }
    if (logo_file && props.organization) {
      await uploadLogo(props.organization.id, logo_file)
    }
    toast.success(t('Organization updated !'))
    emit('refresh')

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}
</script>
