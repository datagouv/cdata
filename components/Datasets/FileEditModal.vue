<template>
  <ModalWithButton
    v-model="open"
    :title="t('File metadata')"
    size="fullscreen"
    @open="setHash"
    @close="removeHash"
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
        {{ $t("Edit file") }}
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
            {{ t('Validate') }}
          </BrandedButton>
          <BrandedButton
            color="secondary"
            :disabled="loading"
            @click="cancel(close)"
          >
            {{ t('Cancel') }}
          </BrandedButton>
        </div>

        <BannerAction
          v-if="dataset && resource.resource"
          class="w-full mt-6"
          type="danger"
          :title="$t('Delete the resource')"
        >
          {{ $t("Be careful, this action can't be reverse.") }}
          <template #button>
            <ModalWithButton
              :title="$t('Are you sure you want to delete this resource?')"
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
                  {{ $t('Delete') }}
                </BrandedButton>
              </template>
              <p class="fr-text--bold">
                {{ $t("This action can't be reverse.") }}
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
                    {{ $t("Delete the resource") }}
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

onMounted(() => {
  if (props.openOnMounted) open.value = true
})
const setHash = () => {
  if (!props.resource.resource) return
  window.history.replaceState(null, '', `${route.path}#${props.resource.resource.id}`)
}
const removeHash = () => {
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
