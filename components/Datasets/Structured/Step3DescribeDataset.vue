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
          :id="titleAccordionId"
          :title="$t('Titre du jeu de données')"
          :opened="true"
        >
          <p class="fr-m-0">
            {{ $t("Le titre doit être explicite et permettre de comprendre rapidement le contenu du jeu de données.") }}
          </p>
        </Accordion>
        <Accordion
          :id="descriptionAccordionId"
          :title="$t('Description')"
        >
          <p class="fr-m-0">
            {{ $t("La description doit préciser le contenu, la source, la méthodologie de collecte et toute information utile pour comprendre et réutiliser les données.") }}
          </p>
        </Accordion>
        <Accordion
          :id="frequencyAccordionId"
          :title="$t('Fréquence de mise à jour')"
        >
          <p class="fr-m-0">
            {{ $t("Indiquez la fréquence à laquelle les données sont mises à jour. Cela aide les réutilisateurs à anticiper les nouvelles versions.") }}
          </p>
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
            src="/illustrations/dataset.svg"
            loading="lazy"
            class="size-14 shrink-0"
            alt=""
          />
          <div class="w-full">
            <p class="font-bold mb-1">
              {{ $t('Décrivez votre jeu de données') }}
            </p>
            <p class="m-0 text-xs/5">
              {{ $t('Renseignez les informations essentielles pour identifier votre jeu de données.') }}
            </p>
          </div>
        </SimpleBanner>

        <RequiredExplanation />

        <fieldset
          class="fr-fieldset"
          aria-labelledby="dataset-info-legend"
        >
          <legend
            id="dataset-info-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t("Informations du jeu de données") }}
            </h2>
          </legend>

          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="titleAccordionId"
          >
            <InputGroup
              v-model="form.title"
              :label="$t('Titre')"
              :required="true"
              :has-error="!!getFirstError('title')"
              :error-text="getFirstError('title')"
              :placeholder="$t('Ex: Base de données des équipements publics')"
            />
          </LinkedToAccordion>

          <LinkedToAccordion
            class="fr-fieldset__element fr-mt-3w"
            :accordion="descriptionAccordionId"
          >
            <InputGroup
              v-model="form.description"
              :label="$t('Description')"
              :required="true"
              type="textarea"
              :has-error="!!getFirstError('description')"
              :error-text="getFirstError('description')"
              :placeholder="$t('Décrivez le contenu, la source et l\'utilité de ces données...')"
              :rows="10"
            />
          </LinkedToAccordion>

          <LinkedToAccordion
            class="fr-fieldset__element fr-mt-3w"
            :accordion="frequencyAccordionId"
          >
            <SearchableSelect
              v-model="form.frequency"
              :label="$t('Fréquence de mise à jour')"
              :placeholder="$t('Recherchez une fréquence…')"
              :get-option-id="(frequency) => frequency.label"
              :display-value="(frequency) => frequency.label"
              :options="frequencies ?? []"
              :multiple="false"
              :required="true"
              :error-text="getFirstError('frequency')"
            />
          </LinkedToAccordion>
        </fieldset>

        <Alert
          v-if="customErrors.length"
          type="error"
          class="fr-mt-2w fr-mb-2w"
        >
          <template #title>
            {{ $t("Une erreur est survenue | Des erreurs sont survenues", customErrors.length) }}
          </template>
          <ul v-if="customErrors.length > 1">
            <li
              v-for="error in customErrors"
              :key="error"
            >
              {{ error }}
            </li>
          </ul>
          <p v-else>
            {{ customErrors[0] }}
          </p>
        </Alert>

        <div class="fr-grid-row justify-between fr-mt-4w">
          <BrandedButton
            color="secondary"
            @click="$emit('previous')"
          >
            {{ $t("Précédent") }}
          </BrandedButton>
          <BrandedButton
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
import type { Frequency } from '@datagouv/components-next'
import { ref } from 'vue'
import Alert from '~/components/Alert/Alert.vue'
import InputGroup from '~/components/InputGroup/InputGroup.vue'
import SearchableSelect from '~/components/SearchableSelect.vue'
import Sidemenu from '~/components/Sidemenu/Sidemenu.global.vue'
import Accordion from '~/components/Accordion/Accordion.global.vue'
import AccordionGroup from '~/components/Accordion/AccordionGroup.global.vue'
import LinkedToAccordion from '~/components/LinkedToAccordion/LinkedToAccordion.vue'
import RequiredExplanation from '~/components/RequiredExplanation/RequiredExplanation.vue'
import { useForm, required, minLength } from '~/composables/useForm'
import type { DatasetForm } from '~/types/types'

const emit = defineEmits<{
  (e: 'previous' | 'next'): void
}>()

const titleAccordionId = useId()
const descriptionAccordionId = useId()
const frequencyAccordionId = useId()

const { data: frequencies } = await useAPI<Array<Frequency>>('/api/1/datasets/frequencies/', { lazy: true })

const datasetForm = defineModel<DatasetForm>({ required: true })

const form = ref({
  title: datasetForm.value.title || '',
  description: datasetForm.value.description || '',
  frequency: datasetForm.value.frequency || null,
})

const customErrors = ref<string[]>([])

const { getFirstError, validate } = useForm(form, {
  title: [required(), minLength(10)],
  description: [required(), minLength(50)],
  frequency: [required()],
})

async function submit() {
  if (await validate()) {
    datasetForm.value.title = form.value.title
    datasetForm.value.description = form.value.description
    datasetForm.value.frequency = form.value.frequency

    customErrors.value = []
    emit('next')
  }
}
</script>
