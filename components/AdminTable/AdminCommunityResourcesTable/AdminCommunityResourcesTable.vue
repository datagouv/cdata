<template>
  <FileEditModalFromQueryStringClient
    :schemas="schemas ?? []"
    @submit="(closeModal: () => void, resourceForm: CommunityResourceForm) => updateResource(resourceForm.resource, closeModal, resourceForm)"
  />

  <AdminTable>
    <thead>
      <AdminTableTh
        :sorted="sorted('title')"
        scope="col"
        @sort="(direction: SortDirection) => $emit('sort', 'title', direction)"
      >
        {{ t("Titre de la ressource") }}
      </AdminTableTh>
      <AdminTableTh class="w-44">
        {{ t("Statut") }}
      </AdminTableTh>
      <AdminTableTh class="w-14">
        {{ t("Format") }}
      </AdminTableTh>
      <AdminTableTh
        class="w-32"
        :sorted="sorted('created_at_internal')"
        scope="col"
        @sort="(direction: SortDirection) => $emit('sort', 'created_at_internal', direction)"
      >
        {{ t("Créé le") }}
      </AdminTableTh>
      <AdminTableTh
        class="w-32"
        :sorted="sorted('last_modified_internal')"
        scope="col"
        @sort="(direction: SortDirection) => $emit('sort', 'last_modified_internal', direction)"
      >
        {{ t("Modifié le") }}
      </AdminTableTh>
      <AdminTableTh
        class="w-32"
        scope="col"
      >
        {{ t("Action") }}
      </AdminTableTh>
    </thead>
    <tbody>
      <tr
        v-for="communityResource in communityResources"
        :key="communityResource.id"
      >
        <td>
          <AdminContentWithTooltip class="fr-text--bold">
            <TextClamp
              :text="communityResource.title"
              :auto-resize="true"
              :max-lines="2"
            />
          </AdminContentWithTooltip>
          <p v-if="communityResource.dataset">
            <LinkToSubject
              type="Dataset"
              :subject="communityResource.dataset"
            />
          </p>
        </td>
        <td>
          <AdminBadge
            size="xs"
            :type="getStatus(communityResource).type"
          >
            {{ getStatus(communityResource).label }}
          </AdminBadge>
        </td>
        <td>
          <code class="p-1 font-mono bg-gray-lower text-sm text-gray-medium rounded">{{ communityResource.format }}</code>
        </td>
        <td>{{ formatDate(communityResource.created_at) }}</td>
        <td>{{ formatDate(communityResource.last_modified) }}</td>
        <td>
          <FileEditModal
            :dataset="communityResource.dataset"
            :loading
            :resource="resourceToForm(communityResource, schemas ?? [])"
            @submit="(closeModal, resourceForm) => updateResource(communityResource, closeModal, resourceForm)"
            @delete="$emit('refresh')"
          />
        </td>
      </tr>
    </tbody>
  </AdminTable>
</template>

<script setup lang="ts">
import { useFormatDate, type CommunityResource, type Resource, type SchemaResponseData, toast } from '@datagouv/components-next'
import AdminBadge from '../../../components/AdminBadge/AdminBadge.vue'
import AdminTable from '../../../components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '../../../components/AdminTable/Table/AdminTableTh.vue'
import AdminContentWithTooltip from '../../../components/AdminContentWithTooltip/AdminContentWithTooltip.vue'
import type { AdminBadgeType, CommunityResourceForm, CommunityResourceSortedBy, ResourceForm, SortDirection } from '~/types/types'
import FileEditModal from '~/components/Datasets/FileEditModal.vue'
import FileEditModalFromQueryStringClient from '~/components/Datasets/FileEditModalFromQueryString.client.vue'

const props = defineProps<{
  communityResources: Array<CommunityResource>
  sortedBy: CommunityResourceSortedBy
  sortDirection: SortDirection
}>()

const emit = defineEmits<{
  (event: 'sort', column: CommunityResourceSortedBy, direction: SortDirection): void
  (event: 'refresh'): void
}>()

const { t } = useTranslation()
const { formatDate } = useFormatDate()

const { data: schemas } = await useAPI<SchemaResponseData>('/api/1/datasets/schemas/')

function sorted(column: CommunityResourceSortedBy) {
  if (props.sortedBy === column) {
    return props.sortDirection
  }
  return null
}

function getStatus(communityResource: CommunityResource): { label: string, type: AdminBadgeType } {
  const checked = communityResource.extras && 'check:available' in communityResource.extras
  if (checked && communityResource.extras['check:available'] === false) {
    return {
      label: t('Indisponible'),
      type: 'danger',
    }
  }
  else if (checked) {
    return {
      label: t('Disponible'),
      type: 'primary',
    }
  }
  else {
    return {
      label: t('Pas encore contrôlé'),
      type: 'secondary',
    }
  }
}

const loading = ref(false)
const updateResource = async (communityResource: CommunityResource | Resource | null, closeModal: () => void, resourceForm: ResourceForm | CommunityResourceForm) => {
  if (!communityResource) {
    console.error('[AdminCommunityResourcesTable] Cannot update resource: resource is null')
    return
  }
  if (!('dataset' in communityResource)) {
    console.error('[AdminCommunityResourcesTable] Cannot update resource: expected a CommunityResource with dataset property')
    return
  }
  loading.value = true

  try {
    await saveResourceForm(communityResource.dataset, resourceForm)
    emit('refresh')
    closeModal()
  }
  finally {
    loading.value = false
  }

  toast.success(t('Ressource communautaire mise à jour !'))
}
</script>
