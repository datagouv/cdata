<template>
  <div v-if="pinnedDatastoreId">
    <p class="text-sm text-gray-medium m-0">
      {{ pinnedDatastoreName ? t('Entrepôt cartes.gouv.fr : {name} ({id})', { name: pinnedDatastoreName, id: pinnedDatastoreId }) : t('Entrepôt cartes.gouv.fr : {id}', { id: pinnedDatastoreId }) }}
    </p>
  </div>

  <SelectGroup
    v-else-if="connected === true"
    v-model="localSelection"
    :label="t('Entrepôt cartes.gouv.fr')"
    :hint-text="t('Choisissez l\'entrepôt qui accueillera ce jeu de données sur cartes.gouv.fr. Ce choix ne pourra plus être modifié après le premier envoi.')"
    :options="datastoreOptions"
    class="max-w-sm"
  />

  <p
    v-else
    class="text-sm text-gray-medium m-0"
  >
    {{ t("Connectez-vous à cartes.gouv.fr pour choisir l'entrepôt de ce jeu de données.") }}
  </p>
</template>

<script setup lang="ts">
import { SelectGroup } from '@datagouv/components-next'
import type { GeopfDatastore } from '~/utils/geopf'

const props = defineProps<{
  // Set on the dataset's first successful push, not editable afterwards.
  pinnedDatastoreId: string | null
  connected: boolean | null
}>()

const model = defineModel<string | null>({ default: null })

const { t } = useTranslation()

const { data: datastores } = props.connected === true
  ? await useAPI<Array<GeopfDatastore>>('/api/1/geopf/datastores/')
  : { data: ref(null) }

const datastoreOptions = computed(() => (datastores.value ?? []).map(datastore => ({ label: datastore.name, value: datastore.datastore_id })))
const pinnedDatastoreName = computed(() => (datastores.value ?? []).find(datastore => datastore.datastore_id === props.pinnedDatastoreId)?.name ?? null)

const localSelection = ref<string | null>(null)

watch(() => props.pinnedDatastoreId, (id) => {
  if (id) model.value = id
}, { immediate: true })

watch(localSelection, (id) => {
  if (!props.pinnedDatastoreId) model.value = id
})
</script>
