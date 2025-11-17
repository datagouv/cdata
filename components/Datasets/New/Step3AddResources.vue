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
          :title="$t('Choisir le bon format')"
          :state="accordionState('resources')"
          :opened="true"
        >
          <div class="prose prose-neutral fr-m-0">
            <p class="fr-m-0 fr-mb-1w">
              {{ $t("Les formats doivent être :") }}
            </p>
            <ul>
              <li>{{ $t("ouverts : un format ouvert n'ajoute pas de spécifications techniques qui restreignent l'utilisation des données (ex. utilisation d'un logiciel payant) ;") }}</li>
              <li>{{ $t("facilement réutilisables : un format facilement réutilisable implique que n'importe qui ou serveur peut réutiliser facilement le jeu de données ;") }}</li>
              <li>{{ $t("utilisables dans un système de traitement automatisé : un système de traitement automatisé permet de faire des opérations automatiques, liées à l'exploitation des données (ex. un fichier CSV est facilement utilisable par un système automatisé contrairement à un fichier PDF).") }}</li>
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
          :title="$t('Ajouter de la documentation')"
          :state="accordionState('hasDocumentation')"
        >
          <div class="prose prose-neutral fr-m-0">
            <p class="fr-m-0 fr-mb-1w">
              {{ $t("La description d'un fichier facilite la réutilisation des données. Elle comprend, entre autres :") }}
            </p>
            <ul>
              <li>{{ $t("une description générale du jeu de données ;") }}</li>
              <li>{{ $t("une description du mode de production des données ;") }}</li>
              <li>{{ $t("une description du modèle de données ;") }}</li>
              <li>{{ $t("une description du schéma des données ;") }}</li>
              <li>{{ $t("une description des métadonnées ;") }}</li>
              <li>{{ $t("une description des changements majeurs.") }}</li>
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
              {{ $t('Qu\'est-ce qu\'un fichier ?') }}
            </p>
            <p class="m-0 text-xs/5">
              {{ $t('Un jeu de données peut contenir plusieurs types de fichiers (mises à jour, historique, documentation, code source, API, lien, etc.)') }}
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
                {{ $t("Ajoutez vos premiers fichiers") }}
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
import { BrandedButton, PaddedContainer, SimpleBanner } from '@datagouv/components-next'
import UploadResourceModal from '../UploadResourceModal.vue'
import type { DatasetForm, ResourceForm } from '~/types/types'

const props = defineProps<{
  loading: boolean
  resources: Array<ResourceForm>
  datasetForm: DatasetForm
}>()

const emit = defineEmits<{
  previous: []
  next: [value: Array<ResourceForm>]
}>()

const { data: extensions } = await useAPI<Array<string>>('/api/1/datasets/extensions/')

const { t } = useTranslation()

const publishFileAccordionId = useId()
const addDescriptionAccordionId = useId()

const isDatasetOpen = computed(() => props.datasetForm.access_type === 'open')

const { form, getFirstError, getFirstWarning, touch, validate, errorsAsList: errors } = useForm({
  resources: props.resources,
  hasDocumentation: false,
}, {
  resources: [ruleIf(isDatasetOpen, required(t('Au moins un fichier est requis.')))],
}, {
  resources: [resources => resources.find(resource => !isClosedFormat(resource, extensions.value)) ? null : t('Vous n\'avez pas ajouté de fichier dans un format ouvert.')],
  hasDocumentation: [hasDocumentation => !hasDocumentation ? t('Vous n\'avez pas ajouté de fichier de documentation ni décrit vos fichiers.') : null],
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

const submit = async () => {
  if (await validate()) {
    emit('next', form.value.resources)
  }
}

const accordionState = (key: keyof typeof form.value) => {
  if (getFirstError(key)) return 'error'
  if (getFirstWarning(key)) return 'warning'

  return 'default'
}
</script>
