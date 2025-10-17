<template>
  <div>
    <h2
      v-if="form"
      class="text-sm font-bold uppercase mb-5"
    >
      {{ t("Éditer le profil") }}
    </h2>
    <AnimatedLoader v-if="isLoading && !organization" />
    <DescribeOrganizationFrom
      v-if="organization"
      ref="form"
      v-model="organizationForm"
      type="update"
      :submit-label="$t('Sauvegarder')"
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
          :title="$t('Supprimer l’organisation')"
        >
          {{ t("Attention, cette action ne peut pas être annulée.") }}
          <template #button>
            <ModalWithButton
              :title="t('Êtes-vous sûrs de vouloir supprimer cette organisation ?')"
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
                  {{ t('Supprimer') }}
                </BrandedButton>
              </template>
              <template #default>
                <p class="fr-text--bold">
                  {{ t("Cette action est irréversible.") }}
                </p>
                <p>{{ t("Tous les contenus publiés par cette organisation resteront en ligne, aux mêmes URL, mais sous forme anonyme, c’est-à-dire sans être rattachés à un producteur de données.") }}</p>
                <p>{{ t("Si vous souhaitez aussi supprimer les contenus publiées que vous avez publiés, commencez par supprimer les contenus avant de supprimer votre compte.") }}</p>
              </template>
              <template #footer>
                <div class="flex-1 fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-lg fr-btns-group--icon-left">
                  <button
                    class="fr-btn fr-btn--secondary rounded-full !text-red-600 !border border-solid !border-red-600 !shadow-none"
                    role="button"
                    :loading="isLoading"
                    @click="deleteCurrentOrganization"
                  >
                    {{ t("Supprimer l’organisation") }}
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
import { RiArrowGoBackLine, RiDeleteBin6Line } from '@remixicon/vue'
import { AnimatedLoader, BannerAction, BrandedButton } from '@datagouv/components-next'
import type { Organization, Badge } from '@datagouv/components-next'
import DescribeOrganizationFrom from '~/components/Organization/New/Step2DescribeOrganization.vue'
import { updateOrganization, updateOrganizationBadges, uploadLogo } from '~/api/organizations'

const props = defineProps<{
  organization: Organization
}>()
const emit = defineEmits<{
  refresh: []
}>()

const { t } = useTranslation()
const { toast } = useToast()
const { $api } = useNuxtApp()
const { start, finish, isLoading } = useLoadingIndicator()

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
        path: '/admin/me/profile',
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
    toast.success(t('Organisation mise à jour !'))
    emit('refresh')

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}
</script>
