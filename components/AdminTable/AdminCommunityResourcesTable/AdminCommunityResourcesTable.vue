<template>
  <AdminTable>
    <thead>
      <AdminTableTh
        :sorted="sorted('title')"
        scope="col"
        @sort="(direction: SortDirection) => $emit('sort', 'title', direction)"
      >
        {{ t("Resource title") }}
      </AdminTableTh>
      <AdminTableTh class="w-44">
        {{ t("Status") }}
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
        {{ t("Created at") }}
      </AdminTableTh>
      <AdminTableTh
        class="w-32"
        :sorted="sorted('last_modified_internal')"
        scope="col"
        @sort="(direction: SortDirection) => $emit('sort', 'last_modified_internal', direction)"
      >
        {{ t("Modified at") }}
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
            :resource="resourceToForm(communityResource, schemas || [])"
            @submit="(closeModal, resourceForm) => updateResource(communityResource, closeModal, resourceForm)"
            @delete="$emit('refresh')"
          />
        </td>
      </tr>
    </tbody>
  </AdminTable>
</template>

<script setup lang="ts">
import type { CommunityResource, SchemaResponseData } from '@datagouv/components-next'
import { useI18n } from 'vue-i18n'
import AdminBadge from '../../../components/AdminBadge/AdminBadge.vue'
import AdminTable from '../../../components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '../../../components/AdminTable/Table/AdminTableTh.vue'
import AdminContentWithTooltip from '../../../components/AdminContentWithTooltip/AdminContentWithTooltip.vue'
import type { AdminBadgeType, CommunityResourceSortedBy, ResourceForm, SortDirection } from '~/types/types'
import FileEditModal from '~/components/Datasets/FileEditModal.vue'

const props = defineProps<{
  communityResources: Array<CommunityResource>
  sortedBy: CommunityResourceSortedBy
  sortDirection: SortDirection
}>()

const emit = defineEmits<{
  (event: 'sort', column: CommunityResourceSortedBy, direction: SortDirection): void
  (event: 'refresh'): void
}>()

const config = useRuntimeConfig()
const { t } = useI18n()
const { toast } = useToast()

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
      label: t('Unavailable'),
      type: 'danger',
    }
  }
  else if (checked) {
    return {
      label: t('Available'),
      type: 'primary',
    }
  }
  else {
    return {
      label: t('Not checked yet'),
      type: 'secondary',
    }
  }
}

const loading = ref(false)
const updateResource = async (communityResource: CommunityResource, closeModal: () => void, resourceForm: ResourceForm) => {
  loading.value = true

  try {
    await saveResourceForm(communityResource.dataset, resourceForm)
    emit('refresh')
    closeModal()
  }
  finally {
    loading.value = false
  }

  toast.success(t('Community resource updated!'))
}
</script>
