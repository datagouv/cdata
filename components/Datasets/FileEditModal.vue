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
        {{ $t("Éditer le fichier") }}
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
          <BrandedButton
            color="primary"
            type="submit"
            :form="formId"
            :loading
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
          {{ $t("Attention, cette action ne peut pas être annulée.") }}
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
                {{ $t("Cette action est irréversible.") }}
              </p>
              <template #footer>
                <div
                  class="flex-1 flex justify-end"
                >
                  <BrandedButton
                    color="danger"
                    :loading="deleting"
                    @click="deleteResource(dataset, resource.resource, close)"
                  >
                    {{ $t("Supprimer la ressource") }}
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

const { t } = await useTranslation()
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

onMounted(() => {
  if (props.openOnMounted) open.value = true
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
