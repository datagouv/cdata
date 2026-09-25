<template>
  <div class="bg-white fr-p-3w">
    <template v-if="canEdit">
      <GeopfPanel
        :dataset-id="dataset.id"
        :connected="isGeopfConnected"
        :reauth-required="reauthRequired"
        class="fr-mb-3w"
        @disconnected="onGeopfDisconnected"
      />

      <BrandedButton
        v-if="geopfDatasetStatus?.push.fiche_url"
        color="secondary"
        size="xs"
        :href="geopfDatasetStatus.push.fiche_url"
        new-tab
        class="fr-mb-3w"
      >
        {{ t('Voir la fiche sur cartes.gouv.fr') }}
      </BrandedButton>

      <GeopfDatastoreSelector
        v-model="datastoreId"
        :pinned-datastore-id="geopfDatasetStatus?.push.datastore_id ?? null"
        :connected="isGeopfConnected"
        class="fr-mb-3w"
      />

      <LoadingBlock
        v-slot="{ data: loadedGeopfDatasetStatus }"
        :status="displayStatus"
        :data="geopfDatasetStatus"
      >
        <h2 class="text-sm font-bold uppercase">
          {{ t('Fichiers à envoyer') }}
        </h2>
        <AdminTable
          v-if="loadedGeopfDatasetStatus.pushable.length"
          fixed
        >
          <thead>
            <tr>
              <AdminTableTh
                scope="col"
                class="w-1/2"
              >
                {{ t('Nom du fichier') }}
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-1/6"
              >
                {{ t('Format') }}
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-1/3"
              >
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

        <h2 class="text-sm font-bold uppercase mt-8 mb-3">
          {{ t('Services récupérés depuis cartes.gouv.fr') }}
        </h2>
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
                {{ formatDate(resource.offering.last_synced_at) }}
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

        <GeopfPullButton
          :dataset-id="datasetId"
          :connected="isGeopfConnected"
          :pull="loadedGeopfDatasetStatus.pull"
          :fiche-url="loadedGeopfDatasetStatus.push.fiche_url"
          :refresh="refreshGeopfDatasetStatus"
          class="mt-3"
          @reauth-required="reauthRequired = true"
        />
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

const props = defineProps<{
  dataset: DatasetV2
}>()

const route = useRoute()
const { t } = useTranslation()
const { formatDate } = useFormatDate()

const datasetId = computed(() => String(route.params.id))

const canEdit = computed(() => props.dataset.permissions.edit_resources)

// Everything both tables render, already filtered and projected by udata.
const { data: geopfDatasetStatus, status, refresh: refreshGeopfDatasetStatus } = await useAPI<GeopfDatasetStatus>(
  computed(() => geopfDatasetStatusUrl(datasetId.value)),
  { key: geopfDatasetStatusKey(datasetId.value) },
)

// `status` flips back to 'pending' on every background poll refresh, which would make
// LoadingBlock flash its overlay loader every few seconds. Only show that overlay for the
// genuine first load; once we have data, keep displaying it (dimmed) instead of blinking.
const hasLoadedOnce = ref(geopfDatasetStatus.value !== null)
watch(geopfDatasetStatus, (value) => {
  if (value !== null) hasLoadedOnce.value = true
})
const displayStatus = computed(() => hasLoadedOnce.value && status.value === 'pending' ? 'success' : status.value)

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
