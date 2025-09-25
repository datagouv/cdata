<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Utilisateurs') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="text-2xl font-extrabold text-gray-title mb-5">
      {{ t("Utilisateurs") }}
    </h1>
    <div
      v-if="pageData"
      class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle"
    >
      <div class="fr-col">
        <h2 class="text-sm font-bold uppercase m-0">
          {{ t('{n} utilisateurs | {n} utilisateur | {n} utilisateurs', pageData.total) }}
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
      <div v-if="pageData && pageData.total">
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
                {{ t("Réutilisations") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Actions") }}
              </AdminTableTh>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in pageData.data"
              :key="user.id"
            >
              <td>
                <p class="fr-text--bold fr-m-0">
                  <CdataLink
                    class="fr-link fr-reset-link"
                    :to="`/admin/users/${user.id}/profile`"
                  >
                    {{ user.first_name }} {{ user.last_name }}
                  </CdataLink>
                </p>
                <AdminEmail :user />
              </td>
              <td>{{ formatDate(user.since) }}</td>
              <td>{{ user.metrics.datasets || 0 }}</td>
              <td>{{ user.metrics.reuses || 0 }}</td>
              <td>
                <BrandedButton
                  size="xs"
                  color="secondary-softer"
                  :href="user.page"
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
                  :href="`/admin/users/${user.id}/profile`"
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
        src="/illustrations/users.svg"
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
        {{ t(`Pas d'utilisateurs`) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pagination, useFormatDate, type User } from '@datagouv/components-next'
import { refDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import { RiEyeLine, RiPencilLine, RiSearchLine } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'
import type { DiscussionSortedBy } from '~/types/discussions'
import type { PaginatedArray, SortDirection } from '~/types/types'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import AdminInput from '~/components/AdminInput.vue'

const { t } = useTranslation()
const config = useRuntimeConfig()
const { formatDate } = useFormatDate()

const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref<DiscussionSortedBy>('created')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)
const q = ref('')
const qDebounced = refDebounced(q, 500) // TODO add 500 in config

const url = computed(() => {
  const url = new URL(`/api/1/users`, config.public.apiBase)

  url.searchParams.set('deleted', 'true')
  url.searchParams.set('sort', sortDirection.value)
  url.searchParams.set('q', qDebounced.value)
  url.searchParams.set('page_size', pageSize.value.toString())
  url.searchParams.set('page', page.value.toString())

  return url.toString()
})

const { data: pageData, status } = await useAPI<PaginatedArray<User>>(url, { lazy: true })
</script>
