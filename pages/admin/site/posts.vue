<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Articles') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="text-2xl font-extrabold text-gray-title mb-5">
      {{ t("Articles") }}
    </h1>
    <div
      v-if="pageData"
      class="flex items-center justify-between"
    >
      <h2 class="text-sm font-bold uppercase m-0">
        {{ t('{n} articles', pageData.total) }}
      </h2>
      <div class="flex space-x-2.5">
        <AdminInput
          v-model="q"
          type="search"
          :icon="RiSearchLine"
          :placeholder="$t('Recherche')"
        />
        <BrandedButton
          size="xs"
          :icon="RiAddLine"
          href="/admin/posts/new"
        >
          {{ $t('Créer un article') }}
        </BrandedButton>
      </div>
    </div>

    <LoadingBlock :status>
      <div v-if="pageData && pageData.total">
        <AdminTable>
          <thead>
            <tr>
              <AdminTableTh scope="col">
                {{ t("Titre") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Statut") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Créé le") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Mis à jour le") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Action") }}
              </AdminTableTh>
            </tr>
          </thead>
          <tbody v-if="pageData">
            <tr
              v-for="post in pageData.data"
              :key="post.id"
            >
              <td>
                <a
                  v-if="post.published"
                  :href="post.page"
                  class="link"
                >{{ post.name }}</a>
                <span v-else>{{ post.name }}</span>
              </td>
              <td>
                <AdminBadge
                  size="xs"
                  :type="getStatus(post).type"
                >
                  {{ getStatus(post).label }}
                </AdminBadge>
              </td>
              <td>{{ formatDate(post.created_at) }}</td>
              <td>{{ formatDate(post.last_modified) }}</td>
              <td>
                <BrandedButton
                  size="xs"
                  color="tertiary"
                  :href="post.page"
                  :icon="RiEyeLine"
                  icon-only
                  external
                  keep-margins-even-without-borders
                >
                  {{ $t('Voir la page publique') }}
                </BrandedButton>
                <BrandedButton
                  :href="`/admin/posts/${post.id}`"
                  color="tertiary"
                  :icon="RiPencilLine"
                  icon-only
                  size="xs"
                  keep-margins-even-without-borders
                >
                  {{ t("Modifier") }}
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
        src="/illustrations/journal.svg"
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
        {{ t(`Pas d'article`) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LoadingBlock, Pagination, BrandedButton, useFormatDate } from '@datagouv/components-next'
import { refDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import { RiAddLine, RiEyeLine, RiPencilLine, RiSearchLine } from '@remixicon/vue'
import type { AdminBadgeType, PaginatedArray } from '~/types/types'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import type { Post } from '~/types/posts'

const { t } = useTranslation()
const { formatDate } = useFormatDate()

const page = ref(1)
const pageSize = ref(20)
const q = ref('')
const qDebounced = refDebounced(q, 500) // TODO add 500 in config

const params = computed(() => {
  return {
    with_drafts: true,
    sort: '-created_at',

    q: qDebounced.value,
    page_size: pageSize.value,
    page: page.value,
  }
})

const { data: pageData, status } = await useAPI<PaginatedArray<Post>>('/api/1/posts/', { lazy: true, query: params })

function getStatus(post: Post): { label: string, type: AdminBadgeType } {
  if (post.published) {
    return {
      label: t('Publié le {date}', { date: formatDate(post.published) }),
      type: 'primary',
    }
  }
  else {
    return {
      label: t('Brouillon'),
      type: 'secondary',
    }
  }
}
</script>
