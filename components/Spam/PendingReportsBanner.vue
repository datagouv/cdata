<template>
  <BannerAction
    v-if="report"
    type="warning"
  >
    <template #title>
      <span class="font-bold">{{ $t('Signalé : {reason}', { reason: reasons?.find(reason => reason.value === report!.reason)?.label || report.reason }) }}</span>
    </template>
    <div
      v-if="report.message"
      class="mb-1"
    >
      {{ report.message }}
    </div>
    <TranslationT
      keypath="Le {date} par {author}"
      tag="div"
      class="inline-flex flex-wrap items-center gap-1"
    >
      <template #date>
        <FormattedDate :date="report.reported_at" />
      </template>
      <template #author>
        <AvatarWithName
          v-if="report.by"
          :user="report.by"
          :size="14"
        />
        <span
          v-else
          class="inline-flex items-center gap-1 font-bold"
        >
          <component
            :is="report.reason === 'auto_spam' ? RiRobot2Line : RiSpyLine"
            class="size-3.5 shrink-0"
          />
          {{ report.reason === 'auto_spam' ? $t('Spam bot') : $t('Anonyme') }}
        </span>
      </template>
    </TranslationT>
    <div
      v-if="reports!.total > 1"
      class="mt-1"
    >
      <CdataLink :to="`/admin/site/moderation?subject=${subject.value.id}`">
        {{ $t('Voir les {n} autres signalements | Voir l\'autre signalement | Voir les {n} autres signalements', reports!.total - 1) }}
      </CdataLink>
    </div>
    <!-- Under the text rather than in the `#button` slot: the banner also sits in the narrow
         form column of the admin pages, where three buttons beside the text wrap badly -->
    <div class="mt-3 flex flex-wrap gap-2">
      <BrandedButton
        :icon="RiCheckLine"
        :loading="dismissing"
        :title="report.callbacks_count > 0 ? $t('Rejeter le signalement (déclenchera {n} actions en attente | déclenchera {n} action en attente | déclenchera {n} actions en attente)', report.callbacks_count) : undefined"
        @click="dismiss(report)"
      >
        {{ $t('Rejeter le signalement') }}
      </BrandedButton>
      <BrandedButton
        v-if="switchToPrivate"
        :icon="RiEyeOffLine"
        :loading="hiding"
        :disabled="'private' in subject.value && subject.value.private"
        @click="hide"
      >
        {{ $t('Cacher l\'objet') }}
      </BrandedButton>
      <DeleteUserModal
        v-if="subject.class === 'User'"
        :user="subject.value"
      >
        <template #button="{ attrs, listeners }">
          <BrandedButton
            :icon="RiDeleteBinLine"
            v-bind="attrs"
            v-on="listeners"
          >
            {{ $t('Supprimer l\'objet') }}
          </BrandedButton>
        </template>
      </DeleteUserModal>
      <AdminDeleteModal
        v-else
        :title="$t('Êtes-vous sûr de vouloir supprimer cet objet ?')"
        :delete-url="getDeleteUrl(reportSubject)"
        :deletable-object="subject.value"
        :object-type="getObjectType(subject.class)"
        :object-title="'title' in subject.value ? subject.value.title : subject.value.name"
        @deleted="onDeleted"
      >
        <template #button="{ attrs, listeners }">
          <BrandedButton
            :icon="RiDeleteBinLine"
            v-bind="attrs"
            v-on="listeners"
          >
            {{ $t('Supprimer l\'objet') }}
          </BrandedButton>
        </template>
        <p class="fr-text--bold">
          {{ $t("Cette action est irréversible.") }}
        </p>
      </AdminDeleteModal>
    </div>
  </BannerAction>
</template>

<script setup lang="ts">
import { AvatarWithName, BannerAction, BrandedButton, FormattedDate, toast, TranslationT } from '@datagouv/components-next'
import type { Dataservice, DatasetV2, DatasetV2WithFullObject, Organization, Report, ReportReason, ReportSubject, Reuse, User } from '@datagouv/components-next'
import { RiCheckLine, RiDeleteBinLine, RiEyeOffLine, RiRobot2Line, RiSpyLine } from '@remixicon/vue'
import AdminDeleteModal from '~/components/Admin/AdminDeleteModal.vue'
import CdataLink from '~/components/CdataLink.vue'
import DeleteUserModal from '~/components/User/DeleteUserModal.vue'
import type { PaginatedArray } from '~/types/types'
import { isMeAdmin } from '~/utils/auth'
import { getDeleteUrl, getObjectType, getSwitchToPrivateMethodAndUrl } from '~/utils/reports'

const props = defineProps<{
  subject: { class: 'Dataset', value: DatasetV2 | DatasetV2WithFullObject }
    | { class: 'Reuse', value: Reuse }
    | { class: 'Dataservice', value: Dataservice }
    | { class: 'Organization', value: Organization }
    | { class: 'User', value: User }
}>()

const { t } = useTranslation()
const { $api } = useNuxtApp()

// The reports API is restricted to sysadmins, other visitors would get a 403
const isAdmin = isMeAdmin()

// Only the latest report is shown here, the others are listed in the moderation dashboard
const { data: reports, refresh } = await useAPI<PaginatedArray<Report>>('/api/1/reports/', {
  query: { subject: props.subject.value.id, handled: false, sort: '-reported_at', page_size: 1 },
  lazy: true,
  immediate: isAdmin,
})
const { data: reasons } = await useAPI<Array<ReportReason>>('/api/1/reports/reasons/', {
  lazy: true,
  immediate: isAdmin,
})

const report = computed(() => reports.value?.data[0] ?? null)
const reportSubject = computed<ReportSubject>(() => ({ class: props.subject.class, id: props.subject.value.id }))
const switchToPrivate = computed(() => getSwitchToPrivateMethodAndUrl(reportSubject.value))

const dismissing = ref(false)

async function dismiss(report: Report) {
  dismissing.value = true
  try {
    await $api(`/api/1/reports/${report.id}/`, {
      method: 'PATCH',
      body: { dismissed_at: new Date() },
    })
    await refresh()
    toast.success(t('Signalement rejeté.'))
  }
  catch {
    toast.error(t('Impossible de rejeter le signalement.'))
  }
  finally {
    dismissing.value = false
  }
}

const hiding = ref(false)

async function hide() {
  if (!switchToPrivate.value) return
  hiding.value = true
  try {
    await $api(switchToPrivate.value.url, {
      method: switchToPrivate.value.method,
      body: { private: true },
    })
    // The page owns the object: refreshing its data shows it as a draft
    await refreshNuxtData()
    toast.success(t('Objet caché.'))
  }
  catch {
    toast.error(t('Impossible de cacher l\'objet.'))
  }
  finally {
    hiding.value = false
  }
}

async function onDeleted() {
  // Deleting the object marks its reports as handled: the banner goes away with them
  await refreshNuxtData()
  toast.success(t('Objet supprimé.'))
}
</script>
