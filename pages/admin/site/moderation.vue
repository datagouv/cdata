<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Modération') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="text-2xl font-extrabold text-gray-title mb-5">
      {{ t("Modération") }}
    </h1>
    <TabLinks
      class="mb-5"
      :links="subjectTypeTabs"
    />
    <div
      v-if="pageData"
      class="flex justify-between items-end gap-4"
    >
      <h2 class="text-sm font-bold uppercase m-0 shrink-0">
        {{ t('{n} signalements | {n} signalement | {n} signalements', pageData.total) }}
      </h2>
      <div class="min-w-0 flex flex-wrap items-center justify-end md:gap-x-6 gap-2">
        <FilterChip
          v-if="subjectId"
          class="max-w-96"
          :name="t('Objet')"
          :value="subjectLabel || subjectId"
          :remove-label="t('Retirer le filtre sur l\'objet')"
          @remove="removeSubjectFilter"
        />
        <SearchableSelect
          v-model="filterStatus"
          :placeholder="$t('Filtrer par statut')"
          :label="$t('Filtrer par statut')"
          :options="[{
            label: t('En cours'),
            id: false,
          }, {
            label: t('Traités'),
            id: true,
          }, {
            label: t('Tous'),
            id: null,
          }]"
          :display-value="(option: { label: string }) => option.label"
          :multiple="false"
          class="mb-0"
          hide-label
          required
        />
      </div>
    </div>

    <LoadingBlock
      v-slot="{ data: pageData }"
      :status
      :data="pageData"
    >
      <div v-if="pageData && pageData.total">
        <AdminTable>
          <thead>
            <tr>
              <AdminTableTh
                class="w-full"
                scope="col"
              >
                {{ t("Objet") }}
              </AdminTableTh>
              <AdminTableTh
                class="w-24"
                scope="col"
              >
                {{ t("Statut") }}
              </AdminTableTh>
              <AdminTableTh
                class="w-52"
                scope="col"
              >
                {{ t("Créé le") }}
              </AdminTableTh>
              <AdminTableTh
                class="w-52"
                scope="col"
              >
                {{ t("Signalé le") }}
              </AdminTableTh>
              <AdminTableTh
                class="w-full"
                scope="col"
              >
                {{ t("Raison") }}
              </AdminTableTh>
              <AdminTableTh
                class="w-28"
                scope="col"
              >
                {{ $t('Actions') }}
              </AdminTableTh>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="report in pageData.data"
              :key="report.id"
            >
              <td class="overflow-hidden">
                <template v-if="subjects[report.id]">
                  <div v-if="subjects[report.id].value">
                    <LinkToSubject
                      :type="subjects[report.id].type"
                      :subject="subjects[report.id].value!"
                    />
                  </div>
                  <div v-else>
                    <LinkToSubject
                      :type="subjects[report.id].type"
                      :subject="{ customTitle: report.subject_label || $t('Supprimé'), customUrl: undefined }"
                    />
                  </div>
                  <div v-if="subjects[report.id].value">
                    <OrganizationOwner
                      v-if="'organization' in subjects[report.id].value! && (subjects[report.id].value as any).organization"
                      :organization="(subjects[report.id].value as any).organization"
                      logo-size-class="size-3.5"
                      logo-no-border
                      name-size="xs"
                      name-color="text-gray-plain font-bold"
                    />
                    <AvatarWithName
                      v-if="'owner' in subjects[report.id].value! && (subjects[report.id].value as any).owner"
                      :size="14"
                      :user="(subjects[report.id].value as any).owner"
                      class="text-gray-plain"
                    />
                    <AvatarWithName
                      v-if="subjects[report.id].type === 'Discussion'"
                      :size="14"
                      :user="getDiscussionAuthor(report, subjects[report.id].value as Thread)"
                    />
                  </div>
                </template>
                <div
                  v-else
                  class="animate-pulse-placeholder space-y-1.5"
                >
                  <div class="bg-gray-200 h-3.5 w-3/4" />
                  <div class="bg-gray-200 h-3 w-1/3" />
                </div>
              </td>
              <td>
                <template v-if="subjects[report.id]">
                  <div v-if="subjects[report.id].value">
                    <DatasetBadge
                      v-if="subjects[report.id].type === 'Dataset'"
                      size="xs"
                      :dataset="(subjects[report.id].value as DatasetV2)"
                    />
                    <DataserviceBadge
                      v-else-if="subjects[report.id].type === 'Dataservice'"
                      size="xs"
                      :dataservice="(subjects[report.id].value as Dataservice)"
                    />
                    <ReuseBadge
                      v-else-if="subjects[report.id].type === 'Reuse'"
                      size="xs"
                      :reuse="(subjects[report.id].value as Reuse)"
                    />
                    <div v-else>
                      —
                    </div>
                  </div>
                  <Badge
                    v-else
                    tone="danger"
                    size="xs"
                  >
                    {{ $t('Supprimé') }}
                  </Badge>
                </template>
                <div
                  v-else
                  class="animate-pulse-placeholder"
                >
                  <div class="bg-gray-200 h-3.5 w-14 rounded-full" />
                </div>
              </td>
              <td>
                <template v-if="subjects[report.id]">
                  <div v-if="subjects[report.id].value">
                    <TranslationT
                      tag="div"
                      keypath="Créé le {date}"
                    >
                      <template #date>
                        <FormattedDate :date="getSubjectCreatedDate(report, subjects[report.id])" />
                      </template>
                    </TranslationT>
                    <p
                      v-if="getSubjectCreatedBy(report, subjects[report.id])"
                      class="flex items-center min-w-0"
                    >
                      {{ t('par ') }}
                      <AvatarWithName
                        class="fr-ml-1v min-w-0"
                        :size="14"
                        :user="getSubjectCreatedBy(report, subjects[report.id])!"
                      />
                    </p>
                    <div v-if="report.subject && report.subject.id in activities">
                      <TranslationT
                        tag="div"
                        keypath="Modifié le {date}"
                      >
                        <template #date>
                          <FormattedDate :date="activities[report.subject.id].created_at" />
                        </template>
                      </TranslationT>
                      <p class="flex items-center min-w-0">
                        {{ t('par ') }}
                        <ActivityActor
                          class="fr-ml-1v min-w-0"
                          :actor="activities[report.subject.id].actor"
                        />
                      </p>
                    </div>
                  </div>
                </template>
                <div
                  v-else
                  class="animate-pulse-placeholder"
                >
                  <div class="bg-gray-200 h-3.5 w-20" />
                </div>
              </td>
              <td>
                <div><FormattedDate :date="report.reported_at" /></div>
                <p class="inline-flex items-center">
                  {{ t('par ') }}
                  <ReportAuthor
                    class="fr-ml-1v"
                    :class="{ 'text-gray-plain': !report.by }"
                    :report
                  />
                </p>
              </td>
              <td>
                <div class="font-bold">
                  {{ getReportReasonLabel(report, reasons) }}
                </div>
                {{ report.message }}
              </td>
              <td>
                <div
                  v-if="!subjects[report.id]"
                  class="animate-pulse-placeholder flex items-center gap-1"
                >
                  <div class="bg-gray-200 size-5 rounded" />
                  <div class="bg-gray-200 size-5 rounded" />
                  <div class="bg-gray-200 size-5 rounded" />
                </div>
                <div
                  v-else-if="subjects[report.id].value"
                  class="flex items-center"
                >
                  <div class="relative">
                    <BrandedButton
                      size="xs"
                      color="tertiary"
                      type="button"
                      :icon="RiCheckLine"
                      icon-only
                      keep-margins-even-without-borders
                      :disabled="!!report.dismissed_at"
                      :title="report.callbacks_count > 0 ? t('Rejeter le signalement (déclenchera {n} actions en attente | déclenchera {n} action en attente | déclenchera {n} actions en attente)', report.callbacks_count) : $t('Rejeter le signalement')"
                      @click="dismiss(report)"
                    />
                    <span
                      v-if="report.callbacks_count > 0 && !report.dismissed_at"
                      class="absolute top-0.5 right-0.5 size-2 rounded-full bg-new-warning ring-1 ring-white"
                      aria-hidden="true"
                    />
                  </div>
                  <BrandedButton
                    v-if="report.subject && getSwitchToPrivateMethodAndUrl(report.subject)"
                    size="xs"
                    color="tertiary"
                    type="button"
                    :icon="RiEyeOffLine"
                    icon-only
                    keep-margins-even-without-borders
                    :disabled="isHideBlocked(subjects[report.id].value)"
                    :title="isLockedByDoi(subjects[report.id].value) ? $t('Un jeu de données porteur d\'un DOI ne peut plus être supprimé ni repassé en brouillon, seulement archivé.') : $t('Cacher l\'objet')"
                    @click="switchPrivate(report, report.subject)"
                  />
                  <div
                    v-else
                    class="size-8 flex items-center justify-center"
                  >
                    —
                  </div>
                  <AdminDeleteModal
                    v-if="report.subject"
                    :title="report.subject_embed_id ? $t('Êtes-vous sûr de vouloir supprimer ce commentaire ?') : $t('Êtes-vous sûr de vouloir supprimer cet objet ?')"
                    :delete-url="getDeleteUrl(report.subject, report.subject_embed_id)"
                    :delete-button-label="$t('Supprimer')"
                    :deletable-object="subjects[report.id].value!"
                    :object-type="getObjectType(report.subject.class)"
                    :object-title="getReportSubjectTitle(subjects[report.id]?.value)"
                    @deleted="() => { fetchFullSubject(report, report.subject!); refresh() }"
                  >
                    <template #button="{ attrs, listeners }">
                      <BrandedButton
                        size="xs"
                        color="tertiary"
                        :icon="RiDeleteBinLine"
                        icon-only
                        keep-margins-even-without-borders
                        :disabled="isSubjectDeleted(subjects[report.id].value) || isLockedByDoi(subjects[report.id].value)"
                        :title="isLockedByDoi(subjects[report.id].value) ? $t('Un jeu de données porteur d\'un DOI ne peut plus être supprimé ni repassé en brouillon, seulement archivé.') : $t('Supprimer l\'objet')"
                        v-bind="attrs"
                        v-on="listeners"
                      />
                    </template>
                    <p class="fr-text--bold">
                      {{ $t("Cette action est irréversible.") }}
                    </p>
                  </AdminDeleteModal>
                </div>
              </td>
            </tr>
          </tbody>
        </AdminTable>
        <Pagination
          :page="page"
          :page-size="pageSize"
          :total-results="pageData.total"
          @change="(changedPage: number) => page = changedPage"
        />
      </div>
    </LoadingBlock>

    <div
      v-if="status != 'pending' && pageData && !pageData.total"
      class="flex flex-col items-center"
    >
      <p class="fr-text--bold fr-my-3v">
        {{ t(`Aucun signalement`) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Report, ReportReason, ReportSubject, Activity, Dataservice, DatasetV2, Organization, Reuse, User, UserReference } from '@datagouv/components-next'
import { ActivityActor, AvatarWithName, FilterChip, FormattedDate, LoadingBlock, Pagination, SearchableSelect, BrandedButton, TranslationT, Badge, DatasetBadge, DataserviceBadge, ReuseBadge } from '@datagouv/components-next'
import { computed, ref } from 'vue'
import { RiCheckLine, RiDeleteBinLine, RiEyeOffLine } from '@remixicon/vue'
import type { PaginatedArray } from '~/types/types'
import ReportAuthor from '~/components/Spam/ReportAuthor.vue'
import { dismissReport, switchSubjectToPrivate } from '~/api/reports'
import { getDeleteUrl, getObjectType, getReportReasonLabel, getReportSubjectTitle, getSwitchToPrivateMethodAndUrl, isHideBlocked, isLockedByDoi } from '~/utils/reports'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import AdminDeleteModal from '~/components/Admin/AdminDeleteModal.vue'
import type { Thread } from '~/types/discussions'
import TabLinks from '~/components/TabLinks.vue'

const { t } = useTranslation()
const { $api } = useNuxtApp()

useSeoMeta({ title: t('Modération'), robots: 'noindex' })

const page = ref(1)
const pageSize = ref(20)

const filterStatus = ref({ label: t('En cours'), id: false })
const filterStatusValue = computed(() => filterStatus.value.id === null ? undefined : filterStatus.value.id)

const basePath = '/admin/site/moderation'
const subjectTypeTabs = [
  { href: basePath, label: t('Tous') },
  { href: `${basePath}?type=Dataset`, label: t('Jeux de données') },
  { href: `${basePath}?type=Dataservice`, label: t('API') },
  { href: `${basePath}?type=Reuse`, label: t('Réutilisations') },
  { href: `${basePath}?type=Organization`, label: t('Organisations') },
  { href: `${basePath}?type=Discussion`, label: t('Discussions') },
  { href: `${basePath}?type=User`, label: t('Utilisateurs') },
]

const route = useRoute()
const subjectType = computed(() => {
  const type = route.query.type
  if (typeof type === 'string' && ['Dataset', 'Dataservice', 'Reuse', 'Organization', 'Discussion', 'User'].includes(type)) {
    return type
  }
  return undefined
})

// Set by the "other reports" link of the banner on the reported object's page
const subjectId = computed(() => typeof route.query.subject === 'string' ? route.query.subject : undefined)

const { data: pageData, status, refresh } = await useAPI<PaginatedArray<Report>>(`/api/1/reports/`, { query: {
  handled: filterStatusValue,
  subject_type: subjectType,
  subject: subjectId,
  page: page,
  page_size: pageSize,
  sort: '-reported_at',
} })
const { data: reasons } = await useAPI<Array<ReportReason>>('/api/1/reports/reasons/', { lazy: true })

// Saved on each report when it is created, so it is there even once the object is deleted. Kept once
// read: dismissing the last pending reports, or switching the status, can leave no report to read it from
const subjectLabel = ref<string | null>(null)
watch(pageData, async () => {
  if (!subjectId.value || subjectLabel.value) return
  const label = pageData.value?.data[0]?.subject_label
  if (label) {
    subjectLabel.value = label
    return
  }
  // Opened once every report of the object is handled: any of them, whatever its status, has the label
  const anyReport = await $api<PaginatedArray<Report>>('/api/1/reports/', { query: { subject: subjectId.value, page_size: 1 } })
  subjectLabel.value = anyReport.data[0]?.subject_label ?? null
}, { immediate: true })

function removeSubjectFilter() {
  const { subject: _subject, ...query } = route.query
  navigateTo({ query })
}

const getSubjectUrl = (subject: ReportSubject) => {
  return {
    Dataset: `/api/2/datasets/${subject.id}/`,
    Dataservice: `/api/1/dataservices/${subject.id}/`,
    Reuse: `/api/1/reuses/${subject.id}/`,
    Organization: `/api/1/organizations/${subject.id}/`,
    Discussion: `/api/1/discussions/${subject.id}/`,
    User: `/api/1/users/${subject.id}/`,
  }[subject.class]
}

type RecordSubjectFullObject = { type: 'Dataset', value: null | DatasetV2 }
  | { type: 'Dataservice', value: null | Dataservice }
  | { type: 'Reuse', value: null | Reuse }
  | { type: 'Organization', value: null | Organization }
  | { type: 'Discussion', value: null | Thread }
  | { type: 'User', value: null | User }

const subjects = ref({} as Record<string, RecordSubjectFullObject>)
const fetchFullSubject = async (report: Report, subject: ReportSubject) => {
  if (report.subject_deleted_at) {
    subjects.value[report.id] = { type: subject.class, value: null }
    return
  }

  try {
    const value = await $api<RecordSubjectFullObject['value']>(getSubjectUrl(subject))
    subjects.value[report.id] = { type: subject.class, value } as RecordSubjectFullObject
  }
  catch {
    subjects.value[report.id] = { type: subject.class, value: null }
  }
}

watch(pageData, async () => {
  if (!pageData.value) return
  const promises = pageData.value.data
    .filter(report => report.subject && !subjects.value[report.id])
    .map(report => fetchFullSubject(report, report.subject!))
  await Promise.all(promises)
}, { immediate: true })

const activities = ref({} as Record<string, Activity>)
watchEffect(async () => {
  if (!pageData.value) return

  const subjects = pageData.value.data.map(r => r.subject as ReportSubject).filter(s => s)

  const newActivities = await getLatestActivitiesForObjects($api, subjects)
  activities.value = { ...activities.value, ...newActivities }
})

const dismiss = async (report: Report) => {
  await dismissReport(report)
  await refresh()
}

const switchPrivate = async (report: Report, subject: ReportSubject) => {
  await switchSubjectToPrivate(subject)
  await fetchFullSubject(report, subject)
}

const isSubjectDeleted = (subject: RecordSubjectFullObject['value']) => {
  if (!subject) return true
  if ('deleted' in subject && subject.deleted) return true
  if ('deleted_at' in subject && subject.deleted_at) return true

  return false
}

const getSubjectCreatedBy = (report: Report, subject: RecordSubjectFullObject): UserReference | null => {
  if (subject.type === 'Discussion' && subject.value) {
    return getDiscussionAuthor(report, subject.value)
  }
  if (subject.type === 'Dataset' && subject.value?.owner) return subject.value.owner
  if (subject.type === 'Reuse' && subject.value?.owner) return subject.value.owner
  return null
}

const getSubjectCreatedDate = (report: Report, subject: RecordSubjectFullObject): string => {
  if (subject.type === 'Discussion' && report.subject_embed_id && subject.value) {
    const comment = subject.value.discussion.find(c => c.id === report.subject_embed_id)
    if (comment) return comment.posted_on
  }
  if (subject.type === 'Dataset' && subject.value) return subject.value.created_at
  if (subject.type === 'Dataservice' && subject.value) return subject.value.created_at
  if (subject.type === 'Organization' && subject.value) return subject.value.created_at
  if (subject.type === 'Reuse' && subject.value) return subject.value.created_at
  if (subject.type === 'Discussion' && subject.value) return subject.value.created
  if (subject.type === 'User' && subject.value?.since) return subject.value.since
  return ''
}

const getDiscussionAuthor = (report: Report, thread: Thread) => {
  if (report.subject_embed_id) {
    const comment = thread.discussion.find(c => c.id === report.subject_embed_id)
    if (comment) return comment.posted_by
  }
  return thread.user
}
</script>

<style scoped>
:deep(table) {
  table-layout: fixed;
}

:deep(.link) {
  text-underline-offset: 2px;
}
</style>
