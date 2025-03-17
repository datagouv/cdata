<template>
  <div class="border border-gray-default fr-p-1w">
    <div class="fr-grid-row fr-grid-row--middle no-wrap wrap-md justify-between">
      <div class="fr-col-auto min-width-0">
        <div class="flex items-center mb-1">
          <ResourceIcon
            :resource="resourceForm"
            class="size-4 mr-1"
          />
          <h4 class="fr-m-0 text-base/6 overflow-wrap-anywhere text-overflow-ellipsis">
            {{ resourceForm.title || $t('Nameless resource') }}
          </h4>
        </div>
        <div class="fr-my-0 text-gray-medium fr-grid-row fr-grid-row--middle">
          <div
            v-if="resourceForm.schema?.name"
            class="flex items-center space-x-1 text-sm fr-m-0 overflow-wrap-anywhere text-overflow-ellipsis dash-after"
          >
            <RiInformationLine class="size-3 shrink-0" />
            <span class="truncate">{{ $t('Schema: {schema}', { schema: resourceForm.schema?.name }) }}</span>
          </div>
          <p
            v-if="resourceForm.filetype === 'file' && resourceForm.file && resourceForm.file.raw.name != resourceForm.title"
            class="text-sm fr-m-0 overflow-wrap-anywhere text-overflow-ellipsis dash-after"
          >
            {{ resourceForm.file.raw.name }}
          </p>
          <p
            v-if="resourceForm.resource"
            class="text-sm fr-m-0 dash-after"
          >
            <!-- Not sure if this date is useful, since it's about modification on a ressource  -->
            {{ $t('Updated {date}', { date: formatRelativeIfRecentDate(resourceForm.resource.last_modified) }) }}
          </p>
          <p
            v-if="guessFormat(resourceForm, extensions)"
            class="text-sm fr-m-0"
          >
            {{ guessFormat(resourceForm, extensions) }}
            <template v-if="filesize">
              ({{ formatFilesize(filesize) }})
            </template>
          </p>
        </div>
        <div
          v-if="resourceForm.filetype === 'file'"
          class="flex items-center space-x-1 text-gray-medium text-sm"
        >
          <RiMapPin2Line class="size-3 shrink-0" />
          <span class="truncate">{{ $t('Location: data.gouv.fr servers') }}</span>
        </div>
        <div
          v-if="resourceForm.filetype === 'remote'"
          class="flex items-center space-x-1 text-gray-medium text-sm"
        >
          <RiLink class="size-3 shrink-0" />
          <span class="truncate">{{ $t('URL: {url}', { url: resourceForm.url }) }}</span>
        </div>
        <div
          v-if="resourceForm.resource?.checksum"
          class="flex items-center space-x-1 text-gray-medium text-sm"
        >
          <RiCodeSSlashLine class="size-3 shrink-0" />
          <span class="truncate">{{ $t('Checksum: {checksum}', { checksum: resourceForm.resource?.checksum.value }) }}</span>
        </div>
      </div>
      <div
        v-if="!hideActions && !loaded"
        class="fr-col-auto"
      >
        <FileLoader v-if="loading" />
        <div
          v-else
          class="fr-grid-row fr-grid-row--middle no-wrap wrap-md"
        >
          <p
            v-if="showEditAndWarning"
            class="fr-col-auto fr-mr-1w fr-m-0"
          >
            <FileEditModal
              :resource="resourceForm"
              button-color="secondary"
              button-size="sm"
              @submit="save"
            />
          </p>
          <p class="fr-col-auto fr-m-0">
            <BrandedButton
              color="secondary"
              :icon="RiDeleteBinLine"
              icon-only
              size="sm"
              @click="$emit('delete')"
            >
              {{ $t("Remove file") }}
            </BrandedButton>
          </p>
        </div>
      </div>
    </div>
    <template v-if="errors && showEditAndWarning">
      <template
        v-for="(fieldErrors, key) in errors"
        :key="key"
      >
        <p
          v-if="fieldErrors && fieldErrors.length"
          class="fr-mt-1w fr-mb-0 fr-text--xs text-default-error"
        >
          <span
            class="fr-icon-error-line fr-icon--sm"
            aria-hidden="true"
          />
          {{ fieldErrors[0] }}
        </p>
      </template>
    </template>
    <template v-if="warnings && showEditAndWarning">
      <template
        v-for="(fieldWarnings, key) in warnings"
        :key="key"
      >
        <p
          v-if="fieldWarnings && fieldWarnings.length"
          class="fr-mt-1w fr-mb-0 fr-text--xs text-default-warning"
        >
          <span
            class="fr-icon-warning-line fr-icon--sm"
            aria-hidden="true"
          >
            {{ fieldWarnings[0] }}
          </span>
        </p>
      </template>
    </template>
    <p
      v-if="resourceForm.filetype === 'file' && resourceForm.file?.state.status === 'failed'"
      class="fr-mt-1w fr-mb-0 fr-text--xs text-default-error"
    >
      <span
        class="fr-icon-error-line fr-icon--sm"
        aria-hidden="true"
      />
      {{ resourceForm.file.state.message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, filesize as formatFilesize, ResourceIcon } from '@datagouv/components-next'
import { computed } from 'vue'
import { RiCodeSSlashLine, RiDeleteBinLine, RiInformationLine, RiLink, RiMapPin2Line } from '@remixicon/vue'
import FileEditModal from '../Datasets/FileEditModal.vue'
import FileLoader from './FileLoader.vue'
import type { ResourceForm } from '~/types/types'

const resourceForm = defineModel<ResourceForm>({ required: true })

withDefaults(defineProps<{
  showEditAndWarning?: boolean
  hideActions?: boolean
  extensions: Array<string>
}>(), {
  showEditAndWarning: true,
  hideActions: false,
})

defineEmits<{
  (e: 'delete' | 'edit'): void
}>()

const save = (close: () => void, form: ResourceForm) => {
  // We don't want to link the `form` inside the modal to the
  // model here because otherwise when clicking "cancel" the
  // modification are still present
  resourceForm.value = { ...form }
  close()
}

const filesize = computed(() => getFilesize(resourceForm.value))

const loading = computed(() => resourceForm.value.filetype === 'file' && resourceForm.value.file?.state.status === 'loading')
const loaded = computed(() => resourceForm.value.filetype === 'file' && resourceForm.value.file?.state.status === 'uploaded')

// Only useful to get potentials errors (no modification here)
const { errors, warnings, validate } = useResourceForm(resourceForm)
watchEffect(() => validate())
</script>
