<template>
  <div class="bg-white fr-p-3w">
    <div class="flex flex-wrap justify-between items-center">
      <h2
        v-if="resourcesPage"
        class="text-sm font-bold uppercase m-0"
      >
        {{ t('{n} fichiers | {n} fichier | {n} fichiers', resourcesPage.total) }}
      </h2>
      <div class="flex items-center space-x-3">
        <component :is="resourcesPage && resourcesPage.total > config.public.maxSortableFiles ? Tooltip : 'div' ">
          <BrandedButton
            v-if="! reorder"
            color="secondary"
            size="xs"
            :icon="RiDraggable"
            :loading="loadingForOrdering"
            :disabled="!!resourcesPage && resourcesPage.total > config.public.maxSortableFiles"
            @click="startReorder()"
          >
            {{ $t('Réordonner les fichiers') }}
          </BrandedButton>

          <template #tooltip>
            {{ $t(`Impossible de réordonner les fichiers quand il y a plus de {max} fichiers`, { max: config.public.maxSortableFiles }) }}
          </template>
        </component>
        <BrandedButton
          v-if="reorder"
          color="primary"
          size="xs"
          :icon="RiCheckLine"
          :disabled="!didSort"
          :loading="loadingForOrdering"
          @click="saveReorder()"
        >
          {{ $t('Sauvegarder le nouvel ordre') }}
        </BrandedButton>
        <BrandedButton
          v-if="reorder"
          color="secondary"
          size="xs"
          :icon="RiCheckLine"
          :loading="loadingForOrdering"
          @click="cancelReorder()"
        >
          {{ $t("Annuler le changement d'ordre") }}
        </BrandedButton>
        <UploadResourceModal
          v-if="! reorder"
          :extensions
          @new-files="addFiles"
        />
      </div>
    </div>

    <!-- :key is here to force re-render when length change and then re-call onMounted -->
    <FileEditModal
      v-if="resourceForms.length"
      :key="resourceForms.length"
      :resource="resourceForms[0]"
      open-on-mounted
      :loading
      @submit="saveFirstNewFile"
      @cancel="removeFirstNewFile"
    />

    <FileEditModalFromQueryStringClient
      :schemas
      :dataset
      @submit="updateResource"
      @delete="refreshResources"
    />

    <LoadingBlock :status>
      <AdminTable v-if="resourcesPage && resourcesPage.data.length">
        <thead>
          <tr>
            <AdminTableTh
              v-if="reorder"
              scope="col"
              class="w-32"
            />
            <AdminTableTh
              scope="col"
            >
              {{ t('Nom du fichier') }}
            </AdminTableTh>
            <AdminTableTh scope="col">
              {{ t("Statut") }}
            </AdminTableTh>
            <AdminTableTh scope="col">
              {{ t("Type") }}
            </AdminTableTh>
            <AdminTableTh scope="col">
              {{ t("Format") }}
            </AdminTableTh>
            <AdminTableTh
              scope="col"
            >
              {{ t('Créé le') }}
            </AdminTableTh>
            <AdminTableTh
              scope="col"
            >
              {{ t('Mis à jour le') }}
            </AdminTableTh>
            <AdminTableTh
              scope="col"
            >
              {{ t("Action") }}
            </AdminTableTh>
          </tr>
        </thead>
        <tbody ref="sortableRoot">
          <tr
            v-for="resource, index in files"
            :key="resource.id"
          >
            <td v-if="reorder">
              <div class="flex items-center">
                <BrandedButton
                  :icon="RiArrowUpLine"
                  color="tertiary"
                  keep-margins-even-without-borders
                  :disabled="index === 0"
                  icon-only
                  @click="moveFile(index, index - 1)"
                >
                  {{ $t('Déplacer vers le haut') }}
                </BrandedButton>
                <RiDraggable class="handle" />
                <BrandedButton
                  :icon="RiArrowDownLine"
                  color="tertiary"
                  keep-margins-even-without-borders
                  :disabled="index === files.length - 1"
                  icon-only
                  @click="moveFile(index, index + 1)"
                >
                  {{ $t('Déplacer vers le bas') }}
                </BrandedButton>
              </div>
            </td>
            <td>
              <TextClamp
                :text="resource.title"
                :auto-resize="true"
                :max-lines="2"
              />
            </td>
            <td>
              <AdminBadge
                size="xs"
                :type="getStatus(resource).type"
              >
                {{ getStatus(resource).label }}
              </AdminBadge>
            </td>
            <td>
              {{ getResourceLabel(resource.type) }}
            </td>
            <td>
              {{ resource.format }}
            </td>
            <td>
              {{ formatDate(resource.created_at) }}
            </td>
            <td>
              {{ formatDate(resource.last_modified) }}
            </td>
            <td>
              <FileEditModal
                :dataset
                :loading
                :resource="resourceToForm(resource, schemas || [])"
                @submit="updateResource"
                @delete="refreshResources"
              />
            </td>
          </tr>
        </tbody>
      </AdminTable>
      <Pagination
        v-if="resourcesPage && resourcesPage.total > pageSize"
        :page="page"
        :page-size="pageSize"
        :total-results="resourcesPage.total"
        @change="(changedPage: number) => page = changedPage"
      />
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import { getResourceLabel, BrandedButton, LoadingBlock, Pagination, Tooltip, useFormatDate, type DatasetV2, type Resource, type SchemaResponseData } from '@datagouv/components-next'
import { RiArrowDownLine, RiArrowUpLine, RiCheckLine, RiDraggable } from '@remixicon/vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { useTemplateRef } from 'vue'
import AdminTable from '../AdminTable/Table/AdminTable.vue'
import AdminTableTh from '../AdminTable/Table/AdminTableTh.vue'
import UploadResourceModal from './UploadResourceModal.vue'
import FileEditModal from './FileEditModal.vue'
import FileEditModalFromQueryStringClient from './FileEditModalFromQueryString.client.vue'
import type { AdminBadgeType, CommunityResourceForm, PaginatedArray, ResourceForm } from '~/types/types'

const route = useRoute()
const { toast } = useToast()
const { $api } = useNuxtApp()
const { formatDate } = useFormatDate()

const { data: schemas } = await useAPI<SchemaResponseData>('/api/1/datasets/schemas/')
const { data: extensions } = await useAPI<Array<string>>('/api/1/datasets/extensions/')

const datasetUrl = computed(() => `/api/2/datasets/${route.params.id}/`)
const { data: dataset, status } = await useAPI<DatasetV2>(datasetUrl, { redirectOn404: true })
const resourcesPage = ref<PaginatedArray<Resource> | null>(null)
const page = ref(1)
const pageSize = ref(20)

const params = computed(() => {
  return {
    page_size: pageSize.value,
    page: page.value,
  }
})

const refreshResources = async () => {
  if (!dataset.value) return
  resourcesPage.value = await $api<PaginatedArray<Resource>>(dataset.value.resources.href, { query: params.value })
}
watchEffect(async () => await refreshResources())

const { t } = useTranslation()

const resourceForms = ref<Array<ResourceForm>>([])
const loading = ref(false)

const addFiles = (files: Array<ResourceForm>) => {
  resourceForms.value = files
}
const removeFirstNewFile = () => {
  resourceForms.value = [...resourceForms.value.slice(1)]
}
const saveFirstNewFile = async (closeModal: () => void, form: ResourceForm | CommunityResourceForm) => {
  loading.value = true
  try {
    await saveResourceForm(dataset.value, form)
    closeModal()
  }
  finally {
    loading.value = false
  }
  removeFirstNewFile()

  page.value = 1
  refreshResources()
}
const updateResource = async (closeModal: () => void, resourceForm: ResourceForm | CommunityResourceForm) => {
  loading.value = true

  try {
    await saveResourceForm(dataset.value, resourceForm)
    await refreshResources()
    closeModal()
  }
  finally {
    loading.value = false
  }

  toast.success(t('Fichier mis à jour !'))
}

const config = useRuntimeConfig()
const sortablesFiles = ref<Array<Resource>>([])
const loadingForOrdering = ref(false)
const sortableRootRef = useTemplateRef('sortableRoot')
const didSort = ref(false)
const reorder = ref(false)

const files = computed(() => reorder.value ? sortablesFiles.value : resourcesPage.value?.data || [])

const startReorder = async () => {
  if (!dataset.value) return
  try {
    useSortable(sortableRootRef, sortablesFiles, {
      onSort: () => {
        didSort.value = true
      },
    })
    loadingForOrdering.value = true
    const baseParams = params.value
    baseParams.page_size = config.public.maxSortableFiles
    sortablesFiles.value = (await $api<PaginatedArray<Resource>>(dataset.value.resources.href, { query: params.value })).data

    reorder.value = true
  }
  catch {
    reorder.value = false
  }
  finally {
    loadingForOrdering.value = false
  }
}

const moveFile = (fromIndex: number, toIndex: number) => {
  if (!reorder.value) throw new Error('Cannot moveFile outside reorder')

  const file = sortablesFiles.value[fromIndex]
  sortablesFiles.value.splice(fromIndex, 1)
  sortablesFiles.value.splice(toIndex, 0, file)
  didSort.value = true
}

const cancelReorder = () => {
  reorder.value = false
  sortablesFiles.value = []
  didSort.value = false
}

const saveReorder = async () => {
  try {
    loadingForOrdering.value = true

    await $api<PaginatedArray<Resource>>(`/api/1/datasets/${dataset.value.id}/resources/`, {
      method: 'PUT',
      body: sortablesFiles.value.map(resource => ({ id: resource.id })),
    })

    await refreshResources()

    cancelReorder()
  }
  finally {
    loadingForOrdering.value = false
  }
}

function getStatus(resource: Resource): { label: string, type: AdminBadgeType } {
  if (resource.extras['check:available'] === true) {
    return {
      label: t('Disponible'),
      type: 'primary',
    }
  }

  if (resource.extras['check:available'] === false) {
    return {
      label: t('Indisponible'),
      type: 'danger',
    }
  }

  return {
    label: t('Inconnu'),
    type: 'warning',
  }
}
</script>
