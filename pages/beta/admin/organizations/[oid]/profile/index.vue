<template>
  <div>
    <h2
      v-if="form"
      :id="form.legend"
      class="text-sm font-bold uppercase mb-5"
    >
      {{ t("Edit profile") }}
    </h2>
    <AdminLoader v-if="loading && !organization" />
    <DescribeOrganizationFrom
      v-if="organization"
      ref="form"
      type="update"
      :submit-label="$t('Save')"
      :organization="organization"
      :errors="errors"
      :show-legend="false"
      :show-well="false"
      @submit="updateCurrentOrganization"
    >
      <template #default>
        <BannerAction
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
                  :disabled="loading"
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
                    :disabled="loading"
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
import { RiDeleteBin6Line } from '@remixicon/vue'
import type { NewOrganization, Organization, BrandedButton, Badge } from '@datagouv/components-next'
import AdminLoader from '~/components/AdminLoader/AdminLoader.vue'
import DescribeOrganizationFrom from '~/components/Organization/New/Step2DescribeOrganization.vue'
import { updateOrganization, updateOrganizationBadges, uploadLogo } from '~/api/organizations'

const props = defineProps<{
  organization: Organization
}>()

const { t } = useI18n()
const { toast } = useToast()
const { $api } = useNuxtApp()
const localPath = useLocalePath()

const form = ref<InstanceType<typeof DescribeOrganizationFrom> | null>(null)

const errors = ref([])

const loading = computed(() => !props.organization)

async function deleteCurrentOrganization() {
  if (props.organization) {
    await $api(`api/1/organizations/${props.organization.id}/`, { method: 'DELETE' })
    reloadNuxtApp({
      path: localPath('/beta/admin/me/profile'),
    })
  }
}

async function updateCurrentOrganization(updatedOrganization: NewOrganization | Organization, logo_file: File | null, newBadges: Array<Badge> | null) {
  await updateOrganization(updatedOrganization as Organization)
  if (newBadges && props.organization) {
    await updateOrganizationBadges(props.organization, newBadges)
  }
  if (logo_file && props.organization) {
    await uploadLogo(props.organization.id, logo_file)
  }

  toast.success(t('Organization updated !'))

  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}
</script>
