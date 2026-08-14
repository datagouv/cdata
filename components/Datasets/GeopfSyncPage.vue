<template>
  <div class="bg-white fr-p-3w">
    <template v-if="canEdit">
      <GeopfPanel
        v-if="dataset"
        :dataset="dataset"
        :connected="isGeopfConnected"
        :reauth-required="reauthRequired"
        class="fr-mb-3w"
        @disconnected="onGeopfDisconnected"
      />

      <GeopfDatastoreSelector
        v-if="dataset"
        v-model="datastoreId"
        :dataset="dataset"
        :connected="isGeopfConnected"
        class="fr-mb-3w"
      />

      <LoadingBlock
        v-slot="{ data: loadedResourcesPage }"
        :status
        :data="resourcesPage"
      >
        <h2 class="text-sm font-bold uppercase">
          {{ t('Fichiers à envoyer') }}
        </h2>
        <AdminTable v-if="loadedResourcesPage && pushableResources.length">
          <thead>
            <tr>
              <AdminTableTh scope="col">
                {{ t('Nom du fichier') }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t('Format') }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t('Envoi') }}
              </AdminTableTh>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="resource in pushableResources"
              :key="resource.id"
            >
              <td>
                <TextClamp
                  :text="resource.title"
                  :auto-resize="true"
                  :max-lines="2"
                />
              </td>
              <td>
                {{ resource.format }}
              </td>
              <td>
                <GeopfPushButton
                  v-if="dataset"
                  :resource="resource"
                  :dataset-id="dataset.id"
                  :connected="isGeopfConnected"
                  :datastore-id="datastoreId"
                  @pushed="onGeopfPushed"
                  @reauth-required="reauthRequired = true"
                />
              </td>
            </tr>
          </tbody>
        </AdminTable>
        <p
          v-else
          class="text-sm text-gray-medium m-0"
        >
          {{ t("Aucun fichier au format GeoPackage (.gpkg) n'a été trouvé dans ce jeu de données.") }}
        </p>

        <div class="flex flex-wrap justify-between items-start gap-2 mt-8 mb-3">
          <h2 class="text-sm font-bold uppercase m-0">
            {{ t('Services récupérés depuis cartes.gouv.fr') }}
          </h2>
          <GeopfPullAction
            v-if="dataset"
            :dataset="dataset"
            :connected="isGeopfConnected"
            @pulled="onGeopfPulled"
            @reauth-required="reauthRequired = true"
          />
        </div>
        <AdminTable v-if="loadedResourcesPage && syncedResources.length">
          <thead>
            <tr>
              <AdminTableTh scope="col">
                {{ t('Nom') }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t('Format') }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t('Dernière synchronisation') }}
              </AdminTableTh>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="resource in syncedResources"
              :key="resource.id"
            >
              <td>
                <TextClamp
                  :text="resource.title"
                  :auto-resize="true"
                  :max-lines="2"
                />
              </td>
              <td>
                {{ resource.format }}
              </td>
              <td>
                {{ formatDate(getGeopfOfferingLastSyncedAt(resource)) }}
              </td>
            </tr>
          </tbody>
        </AdminTable>
        <p
          v-else
          class="text-sm text-gray-medium m-0"
        >
          {{ t("Aucun service n'a encore été synchronisé depuis cartes.gouv.fr.") }}
        </p>

        <BrandedButton
          v-if="ficheUrl"
          color="secondary"
          size="xs"
          :href="ficheUrl"
          new-tab
          class="mt-3"
        >
          {{ t('Voir la fiche sur cartes.gouv.fr') }}
        </BrandedButton>
      </LoadingBlock>
    </template>
    <p
      v-else
      class="text-sm text-gray-medium m-0"
    >
      {{ t('Vous n\'avez pas la permission de synchroniser ce jeu de données avec cartes.gouv.fr.') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, LoadingBlock, useFormatDate, type DatasetV2, type Resource } from '@datagouv/components-next'
import GeopfDatastoreSelector from './GeopfDatastoreSelector.vue'
import GeopfPanel from './GeopfPanel.vue'
import GeopfPullAction from './GeopfPullAction.vue'
import GeopfPushButton from './GeopfPushButton.vue'
import AdminTable from '../AdminTable/Table/AdminTable.vue'
import AdminTableTh from '../AdminTable/Table/AdminTableTh.vue'
import type { PaginatedArray } from '~/types/types'
import { GEOPF_LIST_PAGE_SIZE, getGeopfFicheUrl, getGeopfOfferingLastSyncedAt, getGeopfPullState, getGeopfPushState, isGeopfOffering, isGeopfPushable } from '~/utils/geopf'

const route = useRoute()
const { $api } = useNuxtApp()
const { t } = useTranslation()
const { formatDate } = useFormatDate()
const config = useRuntimeConfig()

const datasetUrl = computed(() => `/api/2/datasets/${route.params.id}/`)
const { data: dataset, status, refresh: refreshDataset } = await useAPI<DatasetV2>(datasetUrl, {
  redirectOn404: true,
  headers: {
    'X-Get-Datasets-Full-Objects': 'True',
  },
})
const canEdit = computed(() => dataset.value?.permissions.edit_resources ?? false)
const ficheUrl = computed(() => dataset.value ? getGeopfFicheUrl(dataset.value) : null)

const { data: geopfConnected } = config.public.geopfEnabled
  ? await useAPI<{ connected: boolean, expires_at: string | null }>('/api/1/geopf/status/')
  : { data: ref(null) }
const isGeopfConnected = computed(() => geopfConnected.value?.connected ?? null)
const reauthRequired = ref(false)
const datastoreId = ref<string | null>(null)

const resourcesPage = ref<PaginatedArray<Resource> | null>(null)
const refreshResources = async () => {
  if (!dataset.value) return
  resourcesPage.value = await $api<PaginatedArray<Resource>>(dataset.value.resources.href, { query: { page_size: GEOPF_LIST_PAGE_SIZE } })
}
watchEffect(async () => await refreshResources())

const pushableResources = computed(() => (resourcesPage.value?.data ?? []).filter(isGeopfPushable))
const syncedResources = computed(() => (resourcesPage.value?.data ?? []).filter(isGeopfOffering))

const geopfPending = computed(() => {
  const pushPending = pushableResources.value.some(r => getGeopfPushState(r).status === 'pending')
  const pullPending = dataset.value ? getGeopfPullState(dataset.value).status === 'pending' : false
  return pushPending || pullPending
})
useGeopfPolling(geopfPending, async () => {
  await Promise.all([refreshResources(), refreshDataset()])
})

const onGeopfPulled = async () => await Promise.all([refreshDataset(), refreshResources()])
// A push can also write dataset-level extras (fiche-url, pinned datastore-id) on its
// first success, so refresh both here too — not just the resource that was pushed.
const onGeopfPushed = async () => await Promise.all([refreshDataset(), refreshResources()])
const onGeopfDisconnected = () => reloadNuxtApp({ path: route.fullPath })
</script>
