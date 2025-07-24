<template>
  <ModalWithButton
    :title="$t('Ajouter un fichier')"
    size="lg"
  >
    <template #button="{ attrs, listeners }">
      <div class="flex flex-col items-center">
        <BrandedButton
          color="primary"
          size="xs"
          :icon="RiUploadLine"
          v-bind="attrs"
          v-on="listeners"
        >
          {{ $t('Ajoutez des fichiers') }}
        </BrandedButton>
        <p
          v-if="errorText"
          class="fr-error-text mt-4 mb-0"
        >
          {{ errorText }}
        </p>
      </div>
    </template>

    <template #default="{ close }">
      <form
        :id="formId"
        @submit.prevent="submit(close)"
      >
        <UploadGroup
          :label="$t('Ajouter des fichiers')"
          type="drop"
          :accept="extensions.join(',')"
          :multiple="true"
          :hint-text="$t('Taille maximale : 420 Mo. Plusieurs fichiers possibles.')"
          @change="setFiles"
        />
        <FileCard
          v-for="(resourceForm, index) in resourceForms"
          :key="index"
          v-model="resourceForms[index]"
          class="fr-mb-3v"
          :show-edit-and-warning="false"
          :extensions
          @delete="removeFile(index)"
        />
        <Divider>{{ $t('ou') }}</Divider>
        <h2 class="text-sm font-bold uppercase mb-2">
          {{ $t('Ajouter un lien') }}
        </h2>
        <InputGroup
          v-model="url"
          :label="$t('Lien exact vers le fichier')"
          :hint-text="$t('Saisissez une url valide, commençant par https://')"
          placeholder="https://"
          type="url"
        />
      </form>
      <!-- :has-error="fieldHasError('modalFiles')"
        :error-text="getErrorText('modalFiles')"
        @change="setFileLink" -->
    </template>

    <template #footer="{ close }">
      <div class="w-full flex gap-4 justify-end">
        <div class="fr-col-auto">
          <BrandedButton
            color="secondary"
            @click="close"
          >
            {{ t("Annuler") }}
          </BrandedButton>
        </div>
        <div class="fr-col-auto">
          <BrandedButton
            color="primary"
            type="submit"
            :form="formId"
          >
            {{ t("Envoyer") }}
          </BrandedButton>
        </div>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { RiUploadLine } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'
import ModalWithButton from '../Modal/ModalWithButton.vue'
import UploadGroup from '../UploadGroup/UploadGroup.vue'
import type { ResourceForm } from '~/types/types'

const { t } = useI18n()
const formId = useId()

defineProps<{
  errorText?: string | null
  extensions: Array<string>
}>()

const emit = defineEmits<{
  (e: 'newFiles', newFiles: Array<ResourceForm>): void
}>()

const url = ref('')

const resourceForms = ref<Array<ResourceForm>>([])

const setFiles = (newFiles: Array<File>) => {
  for (const file of newFiles) {
    resourceForms.value.push({
      filetype: 'file',
      title: file.name,
      type: 'main',
      description: '',
      schema: null,
      file: {
        raw: file,
        state: { status: 'waiting' },
      },
      resource: null,
    })
  }
}
const removeFile = (position: number) => resourceForms.value.splice(position, 1)
const submit = (close: () => void) => {
  if (url.value) {
    resourceForms.value.push({
      filetype: 'remote',
      title: '',
      type: 'main',
      description: '',
      schema: null,

      url: url.value,
      format: '',
      mime: null,
      resource: null,
    })
  }

  emit('newFiles', resourceForms.value)
  resourceForms.value = []
  close()
}
</script>
