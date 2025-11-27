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
            id: 'ongoing',
          }, {
            label: t('Traités'),
            id: 'done',
          }, {
            label: t('Tous'),
            id: '',
          }]"
          :display-value="(option) => option.label"
          :multiple="false"
          class="mb-0"
          hide-label
          required
        />
      </div>
    </div>

    <LoadingBlock :status>
      <div v-if="pageData && pageData.total">
        <AdminTable>
          <thead>
            <tr>
              <AdminTableTh scope="col">
                {{ t("Objet") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Statut") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Créé le") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Signalé le") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Raison") }}
              </AdminTableTh>
              <AdminTableTh scope="col" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="report in pageData.data"
              :key="report.id"
            >
              <td>
                <div v-if="subjects[report.id]">
                  <LinkToSubject
                    :type="subjects[report.id].type"
                    :subject="subjects[report.id].value"
                  />
                </div>
                <div v-if="subjects[report.id]">
                  <OrganizationOwner
                    v-if="'organization' in subjects[report.id].value && subjects[report.id].value.organization"
                    :organization="subjects[report.id].value.organization"
                    logo-size-class="size-3.5"
                    logo-no-border
                  />
                  <AvatarWithName
                    v-if="'owner' in subjects[report.id].value && subjects[report.id].value.owner"
                    :size="14"
                    :user="subjects[report.id].value.owner"
                    class="space-x-2"
                  />
                </div>
              </td>
              <td>
                <DatasetBadge
                  v-if="subjects[report.id] && subjects[report.id].type === 'Dataset'"
                  :dataset="subjects[report.id].value"
                />
                <DataserviceBadge
                  v-else-if="subjects[report.id] && subjects[report.id].type === 'Dataservice'"
                  :dataservice="subjects[report.id].value"
                />
                <ReuseBadge
                  v-else-if="subjects[report.id] && subjects[report.id].type === 'Reuse'"
                  :reuse="subjects[report.id].value"
                />
                <div v-else>
                  —
                </div>
              </td>
              <td>
                <div v-if="subjects[report.id] && 'created_at' in subjects[report.id].value">
                  {{ formatDate(subjects[report.id].value.created_at) }}
                </div>
                <div v-else-if="subjects[report.id] && 'created' in subjects[report.id].value">
                  {{ formatDate(subjects[report.id].value.created) }}
                </div>
                <div v-else>
                  —
                </div>
                <p
                  v-if="report.subject && report.subject.id in activities"
                  class="inline-flex items-center"
                >
                  {{ t('par ') }}
                  <AvatarWithName
                    class="fr-ml-1v"
                    :user="activities[report.subject.id].actor"
                  />
                </p>
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
              </td>
              <td>
                <div class="font-bold">
                  {{ reasons.find((reason) => reason.value === report.reason)?.label || report.reason }}
                </div>
                {{ report.message }}
              </td>
              <td>
                <div class="flex items-center">
                  <BrandedButton
                    size="xs"
                    color="tertiary"
                    type="button"
                    :icon="RiCheckLine"
                    icon-only
                    keep-margins-even-without-borders
                    :disabled="!!report.dismissed_at"
                    @click="dismiss(report)"
                  >
                    {{ $t('Rejeter le signalement') }}
                  </BrandedButton>
                  <BrandedButton
                    v-if="report.subject && getSwitchToPrivateMethodAndUrl(report.subject)"
                    size="xs"
                    color="tertiary"
                    type="button"
                    :icon="RiEyeOffLine"
                    icon-only
                    keep-margins-even-without-borders
                    :disabled="subjects[report.id] && 'private' in subjects[report.id].value && subjects[report.id].value.private"
                    @click="switchPrivate(report, report.subject)"
                  >
                    {{ $t("Cacher l'objet") }}
                  </BrandedButton>
                  <div
                    v-else
                    class="size-8 flex items-center justify-center"
                  >
                    —
                  </div>
                  <BrandedButton
                    v-if="report.subject && getDeleteUrl(report.subject)"
                    size="xs"
                    color="tertiary"
                    type="button"
                    :icon="RiDeleteBinLine"
                    icon-only
                    keep-margins-even-without-borders
                    :disabled="subjects[report.id] && isSubjectDeleted(subjects[report.id].value)"
                    @click="deleteSubject(report, report.subject)"
                  >
                    {{ $t("Supprimer l'objet") }}
                  </BrandedButton>
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
import { type Activity, type Dataservice, type DatasetV2, type Organization, type Report, type ReportReason, type ReportSubject, type Reuse, AvatarWithName, LoadingBlock, Pagination, useFormatDate } from '@datagouv/components-next'
import { computed, ref } from 'vue'
import { RiCheckLine, RiDeleteBinLine, RiEyeOffLine } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'
import type { PaginatedArray } from '~/types/types'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import type { Thread } from '~/types/discussions'
import DatasetBadge from '~/components/AdminBadge/DatasetBadge.vue'
import DataserviceBadge from '~/components/AdminBadge/DataserviceBadge.vue'
import ReuseBadge from '~/components/AdminBadge/ReuseBadge.vue'

const { t } = useTranslation()
const { formatDate } = useFormatDate()
const { $api } = useNuxtApp()

const page = ref(1)
const pageSize = ref(20)

const filterStatus = ref({ label: t('En cours'), id: 'ongoing' })
const filterStatusValue = computed(() => filterStatus.value.id || undefined)

const { data: pageData, status, refresh } = await useAPI<PaginatedArray<Report>>(`/api/1/reports/`, { query: {
  status: filterStatusValue,
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

type RecordSubjectFullObject = { type: 'Dataset', value: DatasetV2 }
  | { type: 'Dataservice', value: Dataservice }
  | { type: 'Reuse', value: Reuse }
  | { type: 'Organization', value: Organization }
  | { type: 'Discussion', value: Thread }

const subjects = ref({} as Record<string, RecordSubjectFullObject>)
const fetchFullSubject = async (report: Report, subject: ReportSubject) => {
  console.log(subject.id)
  const value = await $api(getSubjectUrl(subject))
  subjects.value[report.id] = { type: subject.class, value }
}

watch(pageData, async () => {
  if (!pageData.value) return
  for (const report of pageData.value.data) {
    const subject = report.subject
    if (!subject) continue
    if (subjects.value[report.id]) continue

    await fetchFullSubject(report, subject)
  }
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

const getDeleteUrl = (subject: ReportSubject): string | null => {
  return {
    Dataset: `/api/1/datasets/${subject.id}/`,
    Dataservice: `/api/1/dataservices/${subject.id}/`,
    Reuse: `/api/1/reuses/${subject.id}/`,
    Organization: `/api/1/organizations/${subject.id}/`,
    Discussion: null,
  }[subject.class]
}

const isSubjectDeleted = (subject: RecordSubjectFullObject['value']) => {
  if ('deleted' in subject && subject.deleted) return true
  if ('deleted_at' in subject && subject.deleted_at) return true

  return false
}

const deleteSubject = async (report: Report, subject: ReportSubject) => {
  const url = getDeleteUrl(subject)
  if (!url) return

  await $api(url, { method: 'DELETE' })
  await fetchFullSubject(report, subject)
}
</script>
