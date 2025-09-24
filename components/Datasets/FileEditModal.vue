<template>
  <ModalWithButton
    v-model="open"
    :title="t('Métadonnées du fichier')"
    size="fullscreen"
    @open="setQueryString"
    @close="removeQueryString"
  >
    <template
      v-if="!openOnMounted"
      #button="{ attrs, listeners }"
    >
      <BrandedButton
        v-bind="attrs"
        icon-only
        :icon="RiPencilLine"
        :color="buttonColor"
        :size="buttonSize"
        keep-margins-even-without-borders
        v-on="listeners"
      >
        {{ $t('Éditer le fichier') }}
      </BrandedButton>
    </template>

    <template #default="{ close }">
      <div
        v-if="'file' in resourceForm && resourceForm.file && resourceForm.file.state.status === 'loading'"
        class="fixed h-2 top-0 inset-x-0 flex"
      >
        <div
          class="bg-datagouv-dark h-full"
          :style="{ width: `${resourceForm.file.state.percentage_between_0_and_1 * 100}%` }"
        />
      </div>

      <!-- File change alert -->
      <div 
        v-if="hasFileChanged"
        class="fr-alert fr-alert--info fr-mb-2w"
      >
        <p class="fr-alert__title">
          {{ $t('Fichier modifié détecté') }}
        </p>
        <p>
          {{ $t('Ce fichier est différent de celui actuellement stocké.') }}
        </p>
      </div>

      <DescribeResource
        v-model="resourceForm"
        type="update"
        in-modal
        :form-id
        @submit="submit(close)"
      />
    </template>

    <template #footer="{ close }">
      <div class="w-full">
        <div class="w-full flex gap-4">
          <!-- Confirmation modal only if file has changed -->
          <ModalWithButton
            v-if="hasFileChanged"
            :title="$t('Êtes-vous sûr de vouloir modifier cette ressource ?')"
            size="lg"
          >
            <template #button="{ attrs, listeners }">
              <BrandedButton
                color="primary"
                :form="formId"
                :loading
                v-bind="attrs"
                v-on="listeners"
              >
                {{ t('Valider') }}
              </BrandedButton>
            </template>
            <div class="fr-mt-4w">
              <p>
                {{ $t(`Attention : l'`) }} 
                <a 
                  :href="`https://tabular-api.data.gouv.fr/api/resources/${resource.resource?.id}/`"
                  target="_blank"
                  class="fr-link"
                >
                  {{ $t('API automatique') }}
                </a>
                {{ $t('fournie par data.gouv.fr est directement liée à la structure du fichier.') }}
              </p>
              <p>
                {{ $t('Une modification (par exemple ajout, suppression ou renommage de colonnes) peut casser des réutilisations.') }}
              </p>
              <p>
                {{ $t('Si possible, conservez la même structure pour limiter les impacts.') }}
              </p>
            </div>
            <template #footer>
              <div class="flex-1 flex justify-end">
                <BrandedButton
                  color="primary"
                  :loading="loading"
                  @click="confirmSubmit(close)"
                >
                  {{ $t('Confirmer la modification') }}
                </BrandedButton>
              </div>
            </template>
          </ModalWithButton>
          
          <!-- Simple validation button if file hasn't changed -->
          <BrandedButton
            v-else
            color="primary"
            :form="formId"
            :loading
            @click="confirmSubmit(close)"
          >
            {{ t('Valider') }}
          </BrandedButton>
          
          <BrandedButton
            color="secondary"
            :disabled="loading"
            @click="cancel(close)"
          >
            {{ t('Annuler') }}
          </BrandedButton>
        </div>

        <BannerAction
          v-if="dataset && resource.resource"
          class="w-full mt-6"
          type="danger"
          :title="$t('Supprimer la ressource')"
        >
          {{ $t('Attention, cette action ne peut pas être annulée.') }}
          <template #button>
            <ModalWithButton
              :title="$t('Êtes-vous sûr de vouloir supprimer cette ressource ?')"
              size="lg"
            >
              <template #button="{ attrs, listeners }">
                <BrandedButton
                  color="danger"
                  size="xs"
                  :icon="RiDeleteBin6Line"
                  v-bind="attrs"
                  v-on="listeners"
                >
                  {{ $t('Supprimer') }}
                </BrandedButton>
              </template>
              <p class="fr-text--bold">
                {{ $t('Cette action est irréversible.') }}
              </p>
                <div class="fr-mt-4w">
                  <p>
                    {{ $t('Attention : cette ressource est exposée via une') }} 
                    <a 
                      href="https://www.data.gouv.fr/dataservices/api-tabulaire-data-gouv-fr-beta/"
                      target="_blank"
                      class="fr-link"
                    >
                      {{ $t('API automatique') }}
                    </a>
                    {{ $t('fournie par data.gouv.fr.') }}
                  </p>
                  <p>
                    {{ $t('Si vous supprimez la ressource,') }} 
                    <a 
                      :href="`https://tabular-api.data.gouv.fr/api/resources/${resource.resource?.id}/`"
                      target="_blank"
                      class="fr-link"
                    >
                      {{ $t(`l'API`) }}
                    </a>
                    {{ $t('sera également supprimée et pourra cesser de fonctionner pour les réutilisateurs.') }}
                  </p>
                </div>
              <template #footer>
                <div
                  class="flex-1 flex justify-end"
                >
                  <BrandedButton
                    color="danger"
                    :loading="deleting"
                    @click="deleteResource(dataset, resource.resource, close)"
                  >
                    {{ $t('Supprimer la ressource') }}
                  </BrandedButton>
                </div>
              </template>
            </ModalWithButton>
          </template>
        </BannerAction>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton, isCommunityResource } from '@datagouv/components-next'
import type { Dataset, DatasetV2, Resource } from '@datagouv/components-next'
import { cloneDeep } from 'lodash-es'
import { RiDeleteBin6Line, RiPencilLine } from '@remixicon/vue'
import ModalWithButton from '../Modal/ModalWithButton.vue'
import DescribeResource from './DescribeResource.vue'
import type { CommunityResourceForm, ResourceForm } from '~/types/types'

const { t } = useI18n()
const { $api } = useNuxtApp()
const formId = useId()

const props = withDefaults(defineProps<{
  openOnMounted?: boolean
  loading?: boolean
  dataset?: Dataset | DatasetV2 | Omit<Dataset, 'resources' | 'community_resources'> // only require for deleting a resource :-(
  resource: ResourceForm | CommunityResourceForm
  buttonColor?: InstanceType<typeof BrandedButton>['$props']['color']
  buttonSize?: InstanceType<typeof BrandedButton>['$props']['size']
}>(), {
  loading: false,
  openOnMounted: false,
  buttonColor: 'secondary-softer',
  buttonSize: 'xs',
})
const emit = defineEmits<{
  (e: 'submit', close: () => void, file: ResourceForm | CommunityResourceForm): void
  (e: 'cancel' | 'delete'): void
}>()

const route = useRoute()

const resourceForm = ref(cloneDeep(props.resource))
const open = ref(false)
const hasFileChanged = ref(false)

onMounted(() => {
  if (props.openOnMounted) open.value = true
  
  // Debug: Log current resource file information
  console.log('FileEditModal - Current resource file info:', {
    resourceForm: resourceForm.value,
    originalResource: props.resource.resource,
    filetype: resourceForm.value.filetype,
    hasFile: !!resourceForm.value.file,
    fileInfo: resourceForm.value.file,
    checksum: props.resource.resource?.checksum,
    filesize: props.resource.resource?.filesize,
    title: props.resource.resource?.title
  })
  
  // Debug: Log the complete originalResource structure
  console.log('FileEditModal - Complete originalResource:', props.resource.resource)
  console.log('FileEditModal - originalResource JSON:', JSON.stringify(props.resource.resource, null, 2))
  
  // Function to check if file has changed based on metadata
  const checkFileChange = () => {
    if (!resourceForm.value.file?.raw || !props.resource.resource) {
      hasFileChanged.value = false
      console.log('File change check skipped - no file or original resource')
      return
    }
    
    const newFile = resourceForm.value.file.raw
    const original = props.resource.resource
    
    // Compare file metadata
    const sizeChanged = newFile.size !== original.filesize
    const nameChanged = newFile.name !== original.title
    const typeChanged = newFile.type !== original.mime
    
    hasFileChanged.value = sizeChanged || nameChanged || typeChanged
    
    console.log('File change detection:', {
      newFile: {
        name: newFile.name,
        size: newFile.size,
        type: newFile.type
      },
      original: {
        title: original.title,
        filesize: original.filesize,
        mime: original.mime
      },
      changes: {
        sizeChanged,
        nameChanged,
        typeChanged
      },
      hasFileChanged: hasFileChanged.value
    })
  }
  
  // Watch for file changes
  watch(() => resourceForm.value.file?.raw, (newFile) => {
    if (newFile) {
      checkFileChange()
    } else {
      hasFileChanged.value = false
    }
  })
})
const setQueryString = () => {
  if (!props.resource.resource) return
  window.history.replaceState(null, '', `${route.path}?resource_id=${props.resource.resource.id}`)
}
const removeQueryString = () => {
  if (!props.resource.resource) return
  window.history.replaceState(null, '', `${route.path}`)
}

const submit = (close: () => void) => {
  emit('submit', close, resourceForm.value)
}

const confirmSubmit = (close: () => void) => {
  emit('submit', close, resourceForm.value)
}
const cancel = (close: () => void) => {
  resourceForm.value = cloneDeep(props.resource)
  close()
  emit('cancel')
}

const deleting = ref(false)
const deleteResource = async (dataset: Dataset | DatasetV2 | Omit<Dataset, 'resources' | 'community_resources'>, resource: Resource, close: () => void) => {
  deleting.value = true
  try {
    const { metadataUrl } = getResourcesUrls(dataset, resource, isCommunityResource(resource))
    await $api(metadataUrl, { method: 'DELETE' })
    emit('delete')
  }
  finally {
    deleting.value = false
  }
  close()
}
</script>
