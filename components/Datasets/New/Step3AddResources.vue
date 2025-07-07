<template>
  <div class="flex">
    <Sidemenu
      class="w-5/12 hidden lg:block"
      :button-text="$t('Aide')"
      :on-right="true"
      :fixed="true"
      :show-border="false"
    >
      <template #title>
        <span
          class="fr-icon--sm fr-icon-question-line"
          aria-hidden="true"
        />
        {{ $t('Aide') }}
      </template>
      <AccordionGroup :with-icon="true">
        <Accordion
          :id="publishFileAccordionId"
          :title="$t('Choose the right format')"
          :state="accordionState('resources')"
          :opened="true"
        >
          <div class="prose prose-neutral fr-m-0">
            <p class="fr-m-0 fr-mb-1w">
              {{ $t("Formats should be :") }}
            </p>
            <ul>
              <li>{{ $t("open : an open format doesn't add technical specifications that restrict data use (i.e. using a paid software) ;") }}</li>
              <li>{{ $t("easily reusable : a format easily reusable implies that anybody or server can reuse easily the dataset ;") }}</li>
              <li>{{ $t("usable in an automated processing system : an automated processing system allows to make automatic operations, related to data exploitation (i.e. a CSV file is easily usable by an automated system unlike a PDF file).") }}</li>
            </ul>
          </div>
          <SimpleBanner
            v-if="getFirstWarning('resources')"
            class="font-bold mt-2"
            type="warning"
          >
            {{ getFirstWarning("resources") }}
          </SimpleBanner>
        </Accordion>
        <Accordion
          :id="addDescriptionAccordionId"
          :title="$t('Add documentation')"
          :state="accordionState('hasDocumentation')"
        >
          <div class="prose prose-neutral fr-m-0">
            <p class="fr-m-0 fr-mb-1w">
              {{ $t("The description of a file facilitates the reuse of data. It includes, among others:") }}
            </p>
            <ul>
              <li>{{ $t("a general description of the dataset ;") }}</li>
              <li>{{ $t("a description of the data production mode ;") }}</li>
              <li>{{ $t("a description of the data model ;") }}</li>
              <li>{{ $t("a description of the data schema ;") }}</li>
              <li>{{ $t("a description of the metadata ;") }}</li>
              <li>{{ $t("a description of major changes.") }}</li>
            </ul>
          </div>
          <SimpleBanner
            v-if="getFirstWarning('hasDocumentation')"
            class="font-bold mt-2"
            type="warning"
          >
            {{ getFirstWarning('hasDocumentation') }}
          </SimpleBanner>
        </Accordion>
      </AccordionGroup>
    </Sidemenu>
    <div class="w-full lg:w-7/12">
      <PaddedContainer>
        <SimpleBanner
          type="primary"
          class="mb-4 flex items-center space-x-5"
        >
          <NuxtImg
            src="/illustrations/edit.svg"
            loading="lazy"
            class="size-14 shrink-0"
            alt=""
          />
          <div class="w-full">
            <p class="font-bold mb-1">
              {{ $t('What is a file?') }}
            </p>
            <p class="m-0 text-xs/5">
              {{ $t('A dataset can contain multiple types of files (updates, history, documentation, source code, API, link, etc.)') }}
            </p>
          </div>
        </SimpleBanner>

        <fieldset
          class="fr-fieldset min-width-0"
          aria-labelledby="description-legend"
        >
          <legend
            id="description-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t("Fichiers") }}
            </h2>
          </legend>
          <LinkedToAccordion
            class="fr-fieldset__element min-width-0"
            :accordion="publishFileAccordionId"
          >
            <PaddedContainer
              v-if="form.resources.length === 0"
              class="flex flex-col items-center"
              color="alt-grey"
            >
              <h3 class="fr-text--md fr-text--bold fr-m-0 fr-mb-2w">
                {{ $t("Add your first files") }}
              </h3>
              <UploadResourceModal
                :error-text="getFirstError('resources')"
                :extensions
                @new-files="addResourceForms"
              />
            </PaddedContainer>
            <template v-else>
              <FileCard
                v-for="(_, index) in form.resources"
                :key="index"
                v-model="form.resources[index]"
                class="fr-mb-3v"
                :extensions
                @delete="removeFile(index)"
              />
              <div class="fr-grid-row fr-grid-row--center">
                <UploadResourceModal
                  :extensions
                  @new-files="addResourceForms"
                />
              </div>
            </template>
          </LinkedToAccordion>
        </fieldset>
        <Alert
          v-if="errors.length"
          type="error"
          class="fr-mt-n2w fr-mb-2w"
        >
          <template #title>
            {{ $t("Une erreur est survenue | Des erreurs sont survenues", errors.length) }}
          </template>
          <ul v-if="errors.length > 1">
            <li
              v-for="error in errors"
              :key="error"
            >
              {{ error }}
            </li>
          </ul>
          <p v-else>
            {{ errors[0] }}
          </p>
        </Alert>
        <div class="fr-grid-row justify-between">
          <BrandedButton
            color="secondary"
            @click="$emit('previous')"
          >
            {{ $t("Précédent") }}
          </BrandedButton>
          <BrandedButton
            :loading
            color="primary"
            @click="submit"
          >
            {{ $t("Suivant") }}
          </BrandedButton>
        </div>
      </PaddedContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner } from '@datagouv/components-next'
import UploadResourceModal from '../UploadResourceModal.vue'
import type { ResourceForm } from '~/types/types'

const props = defineProps<{
  loading: boolean
  resources: Array<ResourceForm>
}>()

const emit = defineEmits<{
  previous: []
  next: [value: Array<ResourceForm>]
}>()

const { data: extensions } = await useAPI<Array<string>>('/api/1/datasets/extensions/')

const { t } = useI18n()

const publishFileAccordionId = useId()
const addDescriptionAccordionId = useId()

const { form, getFirstError, getFirstWarning, touch, validate, errorsAsList: errors } = useForm({
  resources: props.resources,
  hasDocumentation: false,
}, {
  resources: [required(t('At least one file is required.'))],
}, {
  resources: [resources => resources.find(resource => !isClosedFormat(resource, extensions.value)) ? null : t('You did not add a file with an open format.')],
  hasDocumentation: [hasDocumentation => !hasDocumentation ? t('You have not added a documentation file or described your files.') : null],
})

watchEffect(() => {
  form.value.hasDocumentation = !!form.value.resources.length && form.value.resources.some(resource => resource.type === 'documentation')
  touch('hasDocumentation')
})

const addResourceForms = (resourceForms: Array<ResourceForm>) => {
  for (const resourceForm of resourceForms) form.value.resources.push(resourceForm)
  touch('resources')
}
const removeFile = (position: number) => {
  form.value.resources.splice(position, 1)
  touch('resources')
}

const submit = () => {
  if (validate()) {
    emit('next', form.value.resources)
  }
}

const accordionState = (key: keyof typeof form.value) => {
  if (getFirstError(key)) return 'error'
  if (getFirstWarning(key)) return 'warning'

  return 'default'
}
</script>
