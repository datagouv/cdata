<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Organisations') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="text-2xl font-extrabold text-gray-title mb-5">
      {{ t("Organisations") }}
    </h1>
    <div
      v-if="pageData"
      class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle"
    >
      <div class="fr-col">
        <h2 class="text-sm font-bold uppercase m-0">
          {{ t('{n} organisations | {n} organisation | {n} organisations', pageData.total) }}
        </h2>
      </div>
      <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
        <AdminInput
          v-model="q"
          type="search"
          :icon="RiSearchLine"
          :placeholder="$t('Recherche')"
        />
      </div>
    </div>

    <LoadingBlock :status>
      <div v-if="pageData && pageData.total > 0">
        <AdminTable>
          <thead>
            <tr>
              <AdminTableTh scope="col">
                {{ t("Nom") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Créé le") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Jeux de données") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("API") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Réutilisations") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Membres") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Actions") }}
              </AdminTableTh>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="organization in pageData.data"
              :key="organization.id"
            >
              <td>
                <div class="flex items-center space-x-2">
                  <OrganizationLogo
                    :organization
                    size-class="size-5"
                  />
                  <AdminContentWithTooltip>
                    <CdataLink
                      class="fr-link fr-reset-link"
                      :to="`/admin/organizations/${organization.id}/profile`"
                    >
                      <TextClamp
                        :text="organization.name"
                        :auto-resize="true"
                        :max-lines="2"
                      />
                    </CdataLink>
                  </AdminContentWithTooltip>
                </div>
              </td>
              <td>{{ formatDate(organization.created_at) }}</td>
              <td>
                <CdataLink :to="`/admin/organizations/${organization.id}/datasets`">
                  {{ organization.metrics.datasets || 0 }}
                </CdataLink>
              </td>
              <td>
                <CdataLink :to="`/admin/organizations/${organization.id}/dataservices`">
                  {{ organization.metrics.dataservices || 0 }}
                </CdataLink>
              </td>
              <td>
                <CdataLink :to="`/admin/organizations/${organization.id}/reuses`">
                  {{ organization.metrics.reuses || 0 }}
                </CdataLink>
              </td>
              <td>
                <CdataLink :to="`/admin/organizations/${organization.id}/members`">
                  {{ organization.metrics.members || 0 }}
                </CdataLink>
              </td>
              <td>
                <BrandedButton
                  size="xs"
                  color="secondary-softer"
                  :href="organization.page"
                  :icon="RiEyeLine"
                  icon-only
                  external
                  keep-margins-even-without-borders
                >
                  {{ $t('Voir la page publique') }}
                </BrandedButton>
                <BrandedButton
                  size="xs"
                  color="secondary-softer"
                  :href="`/admin/organizations/${organization.id}/profile`"
                  :icon="RiPencilLine"
                  icon-only
                  keep-margins-even-without-borders
                >
                  {{ $t('Modifier') }}
                </BrandedButton>
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
      <nuxt-img
        src="/illustrations/organization.svg"
        class="h-20"
      />
      <template v-if="q">
        <p class="fr-text--bold fr-my-3v">
          {{ t(`Pas de résultats pour « {q} »`, { q }) }}
        </p>
        <BrandedButton
          color="primary"
          @click="q = qDebounced = ''"
        >
          {{ $t('Réinitialiser les filtres') }}
        </BrandedButton>
      </template>
      <p
        v-else
        class="fr-text--bold fr-my-3v"
      >
        {{ t(`Pas d'organizations`) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, LoadingBlock, OrganizationLogo, useFormatDate } from '@datagouv/components-next'
import { Pagination, type Organization } from '@datagouv/components-next'
import { refDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import { RiEyeLine, RiPencilLine, RiSearchLine } from '@remixicon/vue'
import type { DiscussionSortedBy } from '~/types/discussions'
import type { PaginatedArray, SortDirection } from '~/types/types'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import AdminInput from '~/components/AdminInput.vue'

const { t } = useTranslation()
const { formatDate } = useFormatDate()
const config = useRuntimeConfig()

const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref<DiscussionSortedBy>('created')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)
const q = ref('')
const qDebounced = refDebounced(q, 500) // TODO add 500 in config

const url = computed(() => {
  const url = new URL(`/api/1/organizations`, config.public.apiBase)

  url.searchParams.set('deleted', 'true')
  url.searchParams.set('sort', sortDirection.value)
  url.searchParams.set('q', qDebounced.value)
  url.searchParams.set('page_size', pageSize.value.toString())
  url.searchParams.set('page', page.value.toString())

  return url.toString()
})

const { data: pageData, status } = await useAPI<PaginatedArray<Organization>>(url, { lazy: true })
</script>
