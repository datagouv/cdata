<template>
  <div class="bg-white fr-p-3w">
    <template v-if="canEdit">
      <GeopfPanel
        v-if="dataset"
        :dataset-id="dataset.id"
        :connected="isGeopfConnected"
        :reauth-required="reauthRequired"
        class="fr-mb-3w"
        @disconnected="onGeopfDisconnected"
      />

      <GeopfDatastoreSelector
        v-model="datastoreId"
        :pinned-datastore-id="geopfDatasetStatus?.datastore_id ?? null"
        :connected="isGeopfConnected"
        class="fr-mb-3w"
      />

      <LoadingBlock
        v-slot="{ data: loadedGeopfDatasetStatus }"
        :status
        :data="geopfDatasetStatus"
      >
        <h2 class="text-sm font-bold uppercase">
          {{ t('Fichiers à envoyer') }}
        </h2>
        <AdminTable v-if="loadedGeopfDatasetStatus.pushable.length">
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
              v-for="resource in loadedGeopfDatasetStatus.pushable"
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
                <GeopfPushStatus
                  :resource="resource"
                  :dataset-id="datasetId"
                  :connected="isGeopfConnected"
                  :datastore-id="datastoreId"
                  :refresh="refreshGeopfDatasetStatus"
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
          {{ t("Aucun fichier éligible n'a été trouvé dans ce jeu de données.") }}
        </p>

        <div class="flex flex-wrap justify-between items-start gap-2 mt-8 mb-3">
          <h2 class="text-sm font-bold uppercase m-0">
            {{ t('Services récupérés depuis cartes.gouv.fr') }}
          </h2>
          <GeopfPullButton
            :dataset-id="datasetId"
            :connected="isGeopfConnected"
            :pull="loadedGeopfDatasetStatus.pull"
            :fiche-url="loadedGeopfDatasetStatus.fiche_url"
            :refresh="refreshGeopfDatasetStatus"
            @reauth-required="reauthRequired = true"
          />
        </div>
        <AdminTable v-if="loadedGeopfDatasetStatus.offerings.length">
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
              v-for="resource in loadedGeopfDatasetStatus.offerings"
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
                {{ formatDate(resource.last_synced_at) }}
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
          v-if="loadedGeopfDatasetStatus.fiche_url"
          color="secondary"
          size="xs"
          :href="loadedGeopfDatasetStatus.fiche_url"
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
import { BrandedButton, LoadingBlock, useFormatDate, type DatasetV2 } from '@datagouv/components-next'
import GeopfDatastoreSelector from './GeopfDatastoreSelector.vue'
import GeopfPanel from './GeopfPanel.vue'
import GeopfPullButton from './GeopfPullButton.vue'
import GeopfPushStatus from './GeopfPushStatus.vue'
import AdminTable from '../AdminTable/Table/AdminTable.vue'
import AdminTableTh from '../AdminTable/Table/AdminTableTh.vue'
import { geopfDatasetStatusKey, geopfDatasetStatusUrl, type GeopfDatasetStatus } from '~/utils/geopf'

const route = useRoute()
const { t } = useTranslation()
const { formatDate } = useFormatDate()

const datasetId = computed(() => String(route.params.id))

// Only for the permission check; dedupes with the parent admin layout's identical call.
const datasetUrl = computed(() => `/api/2/datasets/${datasetId.value}/`)
const { data: dataset } = await useAPI<DatasetV2>(datasetUrl, {
  redirectOn404: true,
  headers: {
    'X-Get-Datasets-Full-Objects': 'True',
  },
})
const canEdit = computed(() => dataset.value?.permissions.edit_resources ?? false)

// Everything both tables render, already filtered and projected by udata.
const { data: geopfDatasetStatus, status, refresh: refreshGeopfDatasetStatus } = await useAPI<GeopfDatasetStatus>(
  computed(() => geopfDatasetStatusUrl(datasetId.value)),
  { key: geopfDatasetStatusKey(datasetId.value) },
)

const { data: geopfConnected } = await useAPI<{ connected: boolean, expires_at: string | null }>('/api/1/geopf/status/')
const isGeopfConnected = computed(() => geopfConnected.value?.connected ?? null)
const reauthRequired = ref(false)
const datastoreId = ref<string | null>(null)

const geopfPending = computed(() => {
  if (!geopfDatasetStatus.value) return false
  return geopfDatasetStatus.value.pushable.some(r => r.push.status === 'pending') || geopfDatasetStatus.value.pull.status === 'pending'
})
useGeopfPolling(geopfPending, refreshGeopfDatasetStatus)

const onGeopfDisconnected = () => reloadNuxtApp({ path: route.fullPath })
</script>
