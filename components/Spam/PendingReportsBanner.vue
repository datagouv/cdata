<template>
  <BannerAction
    v-if="report"
    type="warning"
  >
    <template #title>
      <span class="font-bold">{{ $t('Signalé : {reason}', { reason: getReportReasonLabel(report, reasons) }) }}</span>
    </template>
    <div
      v-if="report.message"
      class="mb-1"
    >
      {{ report.message }}
    </div>
    <TranslationT
      keypath="Signalé {date} par {author}"
      tag="div"
      class="inline-flex flex-wrap items-center gap-1"
    >
      <template #date>
        <FormattedDate
          :date="report.reported_at"
          format="relative"
        />
      </template>
      <template #author>
        <ReportAuthor
          :report
          :size="14"
        />
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
    <!-- Under the text rather than in the `#button` slot: `BannerAction` puts that slot beside the
         text without wrapping, which squeezes the report in the narrow form column of the admin pages -->
    <div class="mt-3 flex flex-wrap gap-2">
      <BrandedButton
        :icon="RiCheckLine"
        :loading="dismissing"
        @click="dismiss(report)"
      >
        {{ $t('Rejeter le signalement') }}
      </BrandedButton>
      <template v-if="withObjectActions">
        <BrandedButton
          v-if="canHide"
          :icon="RiEyeOffLine"
          :loading="hiding"
          @click="hide"
        >
          {{ $t('Cacher l\'objet') }}
        </BrandedButton>
        <AdminDeleteModal
          v-if="canDelete"
          :title="$t('Êtes-vous sûr de vouloir supprimer cet objet ?')"
          :delete-url="getDeleteUrl(reportSubject)"
          :deletable-object="subject.value"
          :object-type="getObjectType(subject.class)"
          :object-title="getReportSubjectTitle(subject.value)"
          @deleted="emit('refresh')"
        >
          <template #button="{ attrs, listeners }">
            <BrandedButton
              color="tertiary"
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
      </template>
    </div>
  </BannerAction>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton, FormattedDate, toast, TranslationT } from '@datagouv/components-next'
import type { Dataservice, DatasetV2, DatasetV2WithFullObject, Organization, Report, ReportReason, ReportSubject, Reuse, User } from '@datagouv/components-next'
import { RiCheckLine, RiDeleteBinLine, RiEyeOffLine } from '@remixicon/vue'
import { dismissReport, switchSubjectToPrivate } from '~/api/reports'
import AdminDeleteModal from '~/components/Admin/AdminDeleteModal.vue'
import CdataLink from '~/components/CdataLink.vue'
import ReportAuthor from '~/components/Spam/ReportAuthor.vue'
import type { PaginatedArray } from '~/types/types'
import { isMeAdmin } from '~/utils/auth'
import { getDeleteUrl, getObjectType, getReportReasonLabel, getReportSubjectTitle, getSwitchToPrivateMethodAndUrl, isLockedByDoi } from '~/utils/reports'

const props = defineProps<{
  subject: { class: 'Dataset', value: DatasetV2 | DatasetV2WithFullObject }
    | { class: 'Reuse', value: Reuse }
    | { class: 'Dataservice', value: Dataservice }
    | { class: 'Organization', value: Organization }
    | { class: 'User', value: User }
  // Hide and delete, for the pages that do not already offer them next to the banner
  withObjectActions?: boolean
}>()

const emit = defineEmits<{
  // The page owns the object: it reloads it once hidden or deleted
  refresh: []
}>()

const { t } = useTranslation()

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

// The page reloads its object after acting on it, with the banner's actions or with its own (the
// deletion of the admin pages): deleting the object handles its reports, so the banner must follow
watch(() => props.subject.value, () => {
  if (isAdmin) refresh()
})

const report = computed(() => reports.value?.data[0] ?? null)
const reportSubject = computed<ReportSubject>(() => ({ class: props.subject.class, id: props.subject.value.id }))

const canHide = computed(() => !!getSwitchToPrivateMethodAndUrl(reportSubject.value) && !isLockedByDoi(props.subject.value) && !('private' in props.subject.value && props.subject.value.private))
const canDelete = computed(() => !isLockedByDoi(props.subject.value))

const dismissing = ref(false)

async function dismiss(report: Report) {
  dismissing.value = true
  try {
    await dismissReport(report)
    await refresh()
    // Another pending report may take its place: the banner alone would not show the change
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
  hiding.value = true
  try {
    await switchSubjectToPrivate(reportSubject.value)
    emit('refresh')
  }
  catch {
    toast.error(t('Impossible de cacher l\'objet.'))
  }
  finally {
    hiding.value = false
  }
}
</script>
