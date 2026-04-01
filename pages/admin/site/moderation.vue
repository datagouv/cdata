<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Modération') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="text-2xl font-extrabold text-gray-title mb-5">
      {{ t("Modération") }}
    </h1>
    <div
      v-if="pageData"
      class="flex justify-between items-end"
    >
      <h2 class="text-sm font-bold uppercase m-0">
        {{ t('{n} signalements | {n} signalement | {n} signalements', pageData.total) }}
      </h2>
      <div class="flex-none flex flex-wrap items-center md:gap-x-6 gap-2">
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
              <td>
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
                      :subject="{ customTitle: $t('Supprimé'), customUrl: undefined }"
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
                      :dataset="(subjects[report.id].value as DatasetV2)"
                    />
                    <DataserviceBadge
                      v-else-if="subjects[report.id].type === 'Dataservice'"
                      :dataservice="(subjects[report.id].value as Dataservice)"
                    />
                    <ReuseBadge
                      v-else-if="subjects[report.id].type === 'Reuse'"
                      :reuse="(subjects[report.id].value as Reuse)"
                    />
                    <div v-else>
                      —
                    </div>
                  </div>
                  <AdminBadge
                    v-else
                    type="danger"
                    size="xs"
                  >
                    {{ $t('Supprimé') }}
                  </AdminBadge>
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
                    <div>
                      {{ t('Créé le {date}', { date: formatDate(getSubjectCreatedDate(report, subjects[report.id])) }) }}
                    </div>
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
                      <div>{{ t('Modifié le {date}', { date: formatDate(activities[report.subject.id].created_at) }) }}</div>
                      <p class="flex items-center min-w-0">
                        {{ t('par ') }}
                        <AvatarWithName
                          class="fr-ml-1v min-w-0"
                          :user="activities[report.subject.id].actor"
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
                <div>{{ formatDate(report.reported_at) }}</div>
                <p
                  v-if="report.by"
                  class="inline-flex items-center"
                >
                  {{ t('par ') }}
                  <AvatarWithName
                    class="fr-ml-1v"
                    :user="report.by"
                  />
                </p>
                <p
                  v-else
                  class="inline-flex items-center"
                >
                  {{ t('par ') }}
                  <span
                    class="fr-ml-1v inline-flex items-center space-x-1"
                    :class="report.reason === 'auto_spam' ? 'text-new-primary' : 'text-gray-plain'"
                  >
                    <component
                      :is="report.reason === 'auto_spam' ? RiRobot2Line : RiSpyLine"
                      class="size-3.5 shrink-0"
                    />
                    <span class="font-bold">{{ report.reason === 'auto_spam' ? t('Spam bot') : t('Anonyme') }}</span>
                  </span>
                </p>
              </td>
              <td>
                <div class="font-bold">
                  {{ reasons?.find((reason) => reason.value === report.reason)?.label || report.reason }}
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
                  <BrandedButton
                    size="xs"
                    color="tertiary"
                    type="button"
                    :icon="RiCheckLine"
                    icon-only
                    keep-margins-even-without-borders
                    :disabled="!!report.dismissed_at"
                    :title="$t('Rejeter le signalement')"
                    @click="dismiss(report)"
                  />
                  <BrandedButton
                    v-if="report.subject && getSwitchToPrivateMethodAndUrl(report.subject)"
                    size="xs"
                    color="tertiary"
                    type="button"
                    :icon="RiEyeOffLine"
                    icon-only
                    keep-margins-even-without-borders
                    :disabled="'private' in subjects[report.id].value! && (subjects[report.id].value as any).private"
                    :title="$t('Cacher l\'objet')"
                    @click="switchPrivate(report, report.subject)"
                  />
                  <div
                    v-else
                    class="size-8 flex items-center justify-center"
                  >
                    —
                  </div>
                  <AdminDeleteModal
                    v-if="report.subject && getDeleteUrl(report, report.subject)"
                    :title="report.subject_embed_id ? $t('Êtes-vous sûr de vouloir supprimer ce commentaire ?') : $t('Êtes-vous sûr de vouloir supprimer cet objet ?')"
                    :delete-url="getDeleteUrl(report, report.subject)!"
                    :delete-button-label="$t('Supprimer')"
                    :deletable-object="subjects[report.id].value!"
                    :object-type="getObjectType(report.subject.class)"
                    :object-title="getSubjectTitle(subjects[report.id]?.value)"
                    @deleted="() => fetchFullSubject(report, report.subject!)"
                  >
                    <template #button="{ attrs, listeners }">
                      <BrandedButton
                        size="xs"
                        color="tertiary"
                        :icon="RiDeleteBinLine"
                        icon-only
                        keep-margins-even-without-borders
                        :disabled="isSubjectDeleted(subjects[report.id].value)"
                        :title="$t('Supprimer l\'objet')"
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
import type { Report, ReportReason, ReportSubject, Activity, Dataservice, DatasetV2, Organization, Reuse, UserReference } from '@datagouv/components-next'
import { AvatarWithName, LoadingBlock, Pagination, SearchableSelect, useFormatDate, BrandedButton } from '@datagouv/components-next'
import { computed, ref } from 'vue'
import { RiCheckLine, RiDeleteBinLine, RiEyeOffLine, RiRobot2Line, RiSpyLine } from '@remixicon/vue'
import type { PaginatedArray } from '~/types/types'
import type { ObjectType } from '~/types/delete'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import AdminDeleteModal from '~/components/Admin/AdminDeleteModal.vue'
import type { Thread } from '~/types/discussions'
import DatasetBadge from '~/components/AdminBadge/DatasetBadge.vue'
import DataserviceBadge from '~/components/AdminBadge/DataserviceBadge.vue'
import ReuseBadge from '~/components/AdminBadge/ReuseBadge.vue'

const { t } = useTranslation()
const { formatDate } = useFormatDate()
const { $api } = useNuxtApp()

useSeoMeta({ title: t('Modération'), robots: 'noindex' })

const page = ref(1)
const pageSize = ref(20)

const filterStatus = ref({ label: t('En cours'), id: false })
const filterStatusValue = computed(() => filterStatus.value.id === null ? undefined : filterStatus.value.id)

const { data: pageData, status, refresh } = await useAPI<PaginatedArray<Report>>(`/api/1/reports/`, { query: {
  handled: filterStatusValue,
  page: page,
  pageSize: pageSize,
  sort: '-reported_at',
} })
const { data: reasons } = await useAPI<Array<ReportReason>>('/api/1/reports/reasons/', { lazy: true })

const getSubjectUrl = (subject: ReportSubject) => {
  return {
    Dataset: `/api/2/datasets/${subject.id}/`,
    Dataservice: `/api/1/dataservices/${subject.id}/`,
    Reuse: `/api/1/reuses/${subject.id}/`,
    Organization: `/api/1/organizations/${subject.id}/`,
    Discussion: `/api/1/discussions/${subject.id}/`,
  }[subject.class]
}

type RecordSubjectFullObject = { type: 'Dataset', value: null | DatasetV2 }
  | { type: 'Dataservice', value: null | Dataservice }
  | { type: 'Reuse', value: null | Reuse }
  | { type: 'Organization', value: null | Organization }
  | { type: 'Discussion', value: null | Thread }

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
  await $api(`/api/1/reports/${report.id}`, {
    method: 'PATCH',
    body: {
      dismissed_at: new Date(),
    },
  })
  await refresh()
}

const getSwitchToPrivateMethodAndUrl = (subject: ReportSubject): { method: 'PUT' | 'PATCH', url: string } | null => {
  return {
    Dataset: { method: 'PUT' as const, url: `/api/1/datasets/${subject.id}/` },
    Dataservice: { method: 'PATCH' as const, url: `/api/1/dataservices/${subject.id}/` },
    Reuse: { method: 'PUT' as const, url: `/api/1/reuses/${subject.id}/` },
    Organization: null,
    Discussion: null,
  }[subject.class]
}

const switchPrivate = async (report: Report, subject: ReportSubject) => {
  const methodAndUrl = getSwitchToPrivateMethodAndUrl(subject)
  if (!methodAndUrl) return

  await $api(methodAndUrl.url, {
    method: methodAndUrl.method,
    body: { private: true },
  })
  await fetchFullSubject(report, subject)
}

const getDeleteUrl = (report: Report, subject: ReportSubject): string | null => {
  if (subject.class === 'Discussion' && report.subject_embed_id) {
    const thread = subjects.value[report.id]?.value as Thread | null
    if (!thread) return null
    const commentIndex = thread.discussion.findIndex(comment => comment.id === report.subject_embed_id)
    if (commentIndex < 0) return null
    return `/api/1/discussions/${subject.id}/comments/${commentIndex}/`
  }

  return {
    Dataset: `/api/1/datasets/${subject.id}/`,
    Dataservice: `/api/1/dataservices/${subject.id}/`,
    Reuse: `/api/1/reuses/${subject.id}/`,
    Organization: `/api/1/organizations/${subject.id}/`,
    Discussion: `/api/1/discussions/${subject.id}/`,
  }[subject.class]
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
  return ''
}

const getDiscussionAuthor = (report: Report, thread: Thread) => {
  if (report.subject_embed_id) {
    const comment = thread.discussion.find(c => c.id === report.subject_embed_id)
    if (comment) return comment.posted_by
  }
  return thread.user
}

const getObjectType = (subjectClass: string): ObjectType => {
  return {
    Dataset: 'dataset' as ObjectType,
    Dataservice: 'dataservice' as ObjectType,
    Reuse: 'reuse' as ObjectType,
    Organization: 'organization' as ObjectType,
    Discussion: 'discussion' as ObjectType,
  }[subjectClass] || 'dataset'
}

const getSubjectTitle = (subject: RecordSubjectFullObject['value']): string | undefined => {
  if (!subject) return undefined
  if ('title' in subject) return subject.title
  if ('name' in subject) return subject.name
  return undefined
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
