<template>
  <div class="flex">
    <Sidemenu
      class="w-5/12 hidden lg:block"
      :button-text="$t('Aide')"
      :on-right="true"
      :fixed="true"
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
          :id="nameDataserviceAccordionId"
          :title="t('Nommer son API')"
          :state="accordionState('title')"
        >
          <p class="fr-m-0">
            {{ t(`Donnez un nom pertinent et explicite à votre API pour qu’elle reflète sa fonction ou son domaine d’application. Un bon nom facilite la recherche et l’identification par les utilisateurs. Ajouter systématiquement le préfixe "API" pour uniformisation.`) }}
          </p>
        </Accordion>
        <Accordion
          :id="acronymDataserviceAccordionId"
          :title="t(`Ajouter un sigle ou un acronyme à l'API`)"
          :state="accordionState('acronym')"
        >
          <p class="fr-m-0">
            {{ t('Vous avez la possibilité d’apposer un sigle à votre API. Les lettres qui composent ce sigle n’ont pas besoin d’être séparées par des points.') }}
          </p>
        </Accordion>
        <Accordion
          :id="addDescriptionAccordionId"
          :title="t('Écrire une bonne description')"
          :state="accordionState('description')"
        >
          <p class="fr-m-0">
            {{ t("Rédigez une description claire et précise de l'API. Les usagers ont besoin de comprendre l'objectif de l'API, les données délivrées, le périmètre couvert (la donnée est-elle exhaustive, y-a t'il des manques ?), la fréquence d'actualisation de la donnée, ainsi que les paramètres avec lesquels ils peuvent effectuer un appel.") }}
          </p>
        </Accordion>
        <Accordion
          :id="addBaseUrlAccordionId"
          :title="t('Définir le bon lien vers l’API')"
          :state="accordionState('base_api_url')"
        >
          <p class="fr-m-0">
            {{ t("L'URL de base d'une API est le point d'entrée commun à toutes les requêtes, souvent constitué d'un domaine ou d'une adresse serveur. Elle sert de fondation à laquelle on ajoute des chemins (endpoints) spécifiques pour accéder aux différentes ressources de l'API.") }}
          </p>
        </Accordion>
        <Accordion
          :id="machineDocumentationUrlAccordionId"
          :title="t('Ajouter un lien vers la documentation machine')"
          :state="accordionState('machine_documentation_url')"
        >
          <p class="fr-m-0">
            {{ t("Idéalement, proposez un lien OpenAPI (Swagger) qui permet aux développeurs d'explorer les endpoints, voir les méthodes disponibles, et tester des requêtes directement depuis la documentation. Dans le cas de services géographiques, vous pouvez renseigner un lien vers le service avec une requête GetCapabilities pour obtenir les métadonnées du service.") }}
          </p>
        </Accordion>
        <Accordion
          :id="technicalDocumentationUrlAccordionId"
          :title="t('Ajouter un lien vers la documentation technique')"
          :state="accordionState('machine_documentation_url')"
        >
          <p class="fr-m-0">
            {{ t("Ajoutez un accès vers la documentation technique générale de l'API et indiquant les étapes d'intégration.") }}
          </p>
        </Accordion>
        <Accordion
          :id="rateLimitingDataserviceAccordionId"
          :title="t(`Indiquer la limite d'appels`)"
          :state="accordionState('rate_limiting')"
        >
          <p class="fr-m-0">
            {{ t(`Si le nombre d'appels à votre API est contraint, veuillez définir ici le nombre maximal d'appels par minute, voire par IP et/ou jeton.`) }}
          </p>
        </Accordion>
        <Accordion
          :id="availabilityDataserviceAccordionId"
          :title="t('Indiquer la disponibilité')"
          :state="accordionState('availability')"
        >
          <p class="fr-m-0">
            {{ t('Spécifier la disponibilité moyenne de votre API. La valeur doit être un pourcentage.') }}
          </p>
        </Accordion>
        <Accordion
          v-if="form.owned?.organization"
          :id="contactPointAccordionId"
          :title="$t('Définir un point de contact')"
          :state="accordionState('contact_points')"
        >
          <p class="fr-m-0">
            {{ $t("Spécifiez un point de contact, comme un email ou un lien vers un formulaire, pour que les utilisateurs puissent vous joindre en cas de problème ou pour poser des questions.") }}
          </p>
        </Accordion>
        <Accordion
          :id="accessTypeAccordionId"
          :title="$t('Sélectionner un type d’accès')"
          :state="accordionState('access_type')"
        >
          <p class="fr-m-0">
            {{ $t("Choisissez le type d’accès (ouvert, ouvert avec compte ou restreint). Sélectionnez « ouvert » si les données sont en open data. Sélectionnez « ouvert avec compte » si l'accès aux données est soumis à la nécessité de posséder un compte. Si vous sélectionnez « restreint », précisez les types de publics éligibles à obtenir l'accès à cette API.") }}
          </p>
        </Accordion>
        <Accordion
          :id="addAuthorizationUrlAccordionId"
          :title="t('Ajouter un lien vers la demande d’habilitation')"
          :state="accordionState('authorization_request_url')"
        >
          <p class="fr-m-0">
            {{ t("Si votre API est en accès restreint, veuillez ajouter le lien vers le formulaire de demande d'accès. Vous êtes une administration ? La solution Datapass vous permet de créer et administrer facilement des formulaires de demande d'accès à la donnée.") }}
          </p>
        </Accordion>
        <Accordion
          :id="addBusinessUrlAccordionId"
          :title="t('Ajouter un lien vers la documentation métier')"
          :state="accordionState('business_documentation_url')"
        >
          <p class="fr-m-0">
            {{ t("La documentation métier de votre API explique son périmètre et ses cas d'usages. Elle vient en complément de la documentation technique.") }}
          </p>
        </Accordion>
      </AccordionGroup>
    </Sidemenu>
    <form
      :id="formId"
      class="w-full lg:w-7/12"
      @submit.prevent="submit"
    >
      <div class="p-6 bg-white">
        <SimpleBanner
          v-if="type === 'create'"
          type="primary"
          class="mb-4 flex items-center space-x-5"
        >
          <NuxtImg
            src="/illustrations/dataservice.svg"
            loading="lazy"
            class="size-14 shrink-0"
            alt=""
          />
          <div class="w-full">
            <p class="font-bold mb-1">
              {{ t(`Qu'est-ce qu'une API ?`) }}
            </p>
            <p class="m-0 text-xs/5">
              {{ t('Une API est un outil informatique qui permet à un site internet ou à un logiciel de communiquer avec un autre ordinateur et échanger de la donnée.') }}
            </p>
          </div>
        </SimpleBanner>

        <slot name="top" />

        <RequiredExplanation />
        <fieldset
          v-if="type === 'create'"
          class="fr-fieldset"
          aria-labelledby="description-legend"
        >
          <legend
            id="description-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t("Producteur") }}
            </h2>
          </legend>
          <div class="fr-fieldset__element">
            <ProducerSelect
              v-model="form.owned"
              :label="t(`Vérifiez l'identité avec laquelle vous souhaitez publier`)"
              :options="ownedOptions"
              :error-text="getFirstError('owned')"
              :warning-text="getFirstWarning('owned')"
              :all="isMeAdmin()"
              @focusout="touch('owned')"
            />
          </div>
        </fieldset>
        <fieldset
          class="fr-fieldset min-width-0"
          aria-labelledby="description-legend"
        >
          <legend
            id="description-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t("Description") }}
            </h2>
          </legend>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="nameDataserviceAccordionId"
            @blur="touch('title')"
          >
            <InputGroup
              v-model="form.title"
              class="mb-3"
              :aria-describedby="nameDataserviceAccordionId"
              :label="t(`Nom de l'API`)"
              :required="true"
              :has-error="!!getFirstError('title')"
              :has-warning="!!getFirstWarning('title')"
              :error-text="getFirstError('title')"
            />
            <SimpleBanner
              v-if="getFirstWarning('title')"
              class="mt-2"
              type="warning"
            >
              {{ getFirstWarning("title") }}
            </SimpleBanner>
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="acronymDataserviceAccordionId"
            @blur="touch('acronym')"
          >
            <InputGroup
              v-model="form.acronym"
              :aria-describedby="acronymDataserviceAccordionId"
              :label="t('Acronyme')"
              :required="false"
              :has-error="!!getFirstError('acronym')"
              :has-warning="!!getFirstWarning('acronym')"
              :error-text="getFirstError('acronym')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element min-width-0"
            :accordion="addDescriptionAccordionId"
          >
            <InputGroup
              v-model="form.description"
              class="mb-3"
              :label="$t('Description')"
              :required="true"
              type="markdown"
              :has-error="!!getFirstError('description')"
              :has-warning="!!getFirstWarning('description')"
              :error-text="getFirstError('description')"
              @change="touch('description')"
            />
            <SimpleBanner
              v-if="getFirstWarning('description')"
              class="mt-2"
              type="warning"
            >
              {{ getFirstWarning("description") }}
            </SimpleBanner>
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addBaseUrlAccordionId"
            @blur="touch('base_api_url')"
          >
            <InputGroup
              v-model="form.base_api_url"
              :aria-describedby="addBaseUrlAccordionId"
              :label="t('Lien racine de l’API')"
              type="url"
              placeholder="https://..."
              :required="false"
              :has-error="!!getFirstError('base_api_url')"
              :has-warning="!!getFirstWarning('base_api_url')"
              :error-text="getFirstError('base_api_url')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="machineDocumentationUrlAccordionId"
            @blur="touch('machine_documentation_url')"
          >
            <InputGroup
              v-model="form.machine_documentation_url"
              :aria-describedby="machineDocumentationUrlAccordionId"
              :label="t(`Lien vers la documentation machine de l'API (fichier OpenAPI ou Swagger)`)"
              type="url"
              placeholder="https://..."
              :required="false"
              :has-error="!!getFirstError('machine_documentation_url')"
              :has-warning="!!getFirstWarning('machine_documentation_url')"
              :error-text="getFirstError('machine_documentation_url')"
              :warning-text="getFirstWarning('machine_documentation_url')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="technicalDocumentationUrlAccordionId"
            @blur="touch('technical_documentation_url')"
          >
            <InputGroup
              v-model="form.technical_documentation_url"
              :aria-describedby="technicalDocumentationUrlAccordionId"
              :label="t(`Lien vers la documentation technique de l'API`)"
              type="url"
              placeholder="https://..."
              :required="false"
              :has-error="!!getFirstError('technical_documentation_url')"
              :has-warning="!!getFirstWarning('technical_documentation_url')"
              :error-text="getFirstError('technical_documentation_url')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="rateLimitingDataserviceAccordionId"
            @blur="touch('rate_limiting')"
          >
            <InputGroup
              v-model="form.rate_limiting"
              :aria-describedby="rateLimitingDataserviceAccordionId"
              :label="t(`Limite d'appels`)"
              :required="false"
              :has-error="!!getFirstError('rate_limiting')"
              :has-warning="!!getFirstWarning('rate_limiting')"
              :error-text="getFirstError('rate_limiting')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="availabilityDataserviceAccordionId"
            @blur="touch('availability')"
          >
            <InputGroup
              v-model="form.availability"
              :aria-describedby="acronymDataserviceAccordionId"
              :label="t('Disponibilité')"
              type="number"
              placeholder="99,9"
              :required="false"
              :has-error="!!getFirstError('availability')"
              :has-warning="!!getFirstWarning('availability')"
              :error-text="getFirstError('availability')"
            />
          </LinkedToAccordion>
        </fieldset>
        <fieldset
          v-if="form.owned?.organization && injectionKey"
          class="fr-fieldset"
          aria-labelledby="description-legend"
        >
          <legend
            id="description-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-0">
              {{ harvested ? t("Attributions et points de contacts") : t("Points de contact") }}
            </h2>
          </legend>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="contactPointAccordionId"
            @blur="touch('contact_points')"
          >
            <ContactPointSelect
              v-for="(contact_point, index) in form.contact_points"
              :key="contact_point && 'id' in contact_point ? contact_point.id : index"
              v-model="form.contact_points[index]"
              class="pt-3"
              :organization="form.owned?.organization"
              :show-attributions="harvested"
              :parent-form-key="injectionKey"
            />
            <ContactPointSelect
              v-if="form.contact_points.length === 0"
              v-model="form.contact_points[0]"
              class="pt-3"
              :organization="form.owned?.organization"
              :show-attributions="harvested"
              :parent-form-key="injectionKey"
            />
            <BrandedButton
              class="mt-3"
              type="button"
              color="primary-soft"
              size="xs"
              :icon="RiAddLine"
              @click="form.contact_points.push({ ...defaultContactForm })"
            >
              {{ harvested ? t('Nouvelle attribution') : t('Nouveau contact') }}
            </BrandedButton>
          </LinkedToAccordion>
        </fieldset>
        <fieldset
          class="fr-fieldset min-width-0"
          aria-labelledby="description-legend"
        >
          <legend
            id="description-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t("Accès") }}
            </h2>
          </legend>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="accessTypeAccordionId"
            @blur="touch('access_type')"
          >
            <RadioButtons
              v-model="form.access_type"
              class="!mb-0"
              :label="t(`Type d'accès`)"
              :options="[
                { value: 'open', label: t('Ouvert') },
                { value: 'open_with_account', label: t('Ouvert avec compte') },
                { value: 'restricted', label: t('Restreint') },
              ]"
            />
            <SimpleBanner
              v-if="getFirstWarning('access_type')"
              class="mt-2"
              type="warning"
            >
              {{ getFirstWarning("access_type") }}
            </SimpleBanner>
            <div
              v-if="form.access_type === 'restricted'"
              class="grid md:grid-cols-2 xl:grid-cols-3 gap-4 items-end"
            >
              <SelectGroup
                v-for="accessAudienceType in accessAudienceTypes"
                :key="accessAudienceType"
                v-model="form.access_audiences[accessAudienceType]"
                class="mb-0"
                :label="getAccessAudienceType(accessAudienceType)"
                :options="accessAudienceConditionOptions"
              />
            </div>
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addAuthorizationUrlAccordionId"
            @blur="touch('authorization_request_url')"
          >
            <InputGroup
              v-model="form.authorization_request_url"
              :aria-describedby="addAuthorizationUrlAccordionId"
              :label="t(`Lien vers l'outil d’habilitation d'accès`)"
              type="url"
              placeholder="https://..."
              :required="false"
              :has-error="!!getFirstError('authorization_request_url')"
              :has-warning="!!getFirstWarning('authorization_request_url')"
              :error-text="getFirstError('authorization_request_url')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addBusinessUrlAccordionId"
            @blur="touch('business_documentation_url')"
          >
            <InputGroup
              v-model="form.business_documentation_url"
              :aria-describedby="addBusinessUrlAccordionId"
              :label="t(`Lien vers la documentation métier de l'API`)"
              type="url"
              placeholder="https://..."
              :required="false"
              :has-error="!!getFirstError('business_documentation_url')"
              :has-warning="!!getFirstWarning('business_documentation_url')"
              :error-text="getFirstError('business_documentation_url')"
            />
          </LinkedToAccordion>
        </fieldset>
        <div class="fr-grid-row fr-grid-row--right">
          <ModalClient
            :title="$t(`Êtes vous-sûr de vouloir publier cette API sans documentation OpenAPI/Swagger ?`)"
            size="lg"
            :opened="openConfirmModal"
          >
            <i18n-t
              keypath="Une documentation OpenAPI/swagger est un standard attendu par les utilisateurs d'API. Ce format est facile à mettre en place, vous pouvez utiliser l'éditeur officiel : {editor}."
              tag="p"
            >
              <template #editor>
                <a
                  href="https://editor.swagger.io/"
                  class="whitespace-nowrap"
                > https://editor.swagger.io/</a>
              </template>
            </i18n-t>

            <p>{{ $t(`Si néanmoins vous souhaitez tout de même publier votre API sans ce standard, celle-ci sera moins mise en avant par le moteur de recherche de {site}.`, { site: config.public.title }) }}</p>

            <template #footer>
              <div class="w-full flex justify-end space-x-4">
                <BrandedButton
                  color="secondary"
                  @click="openConfirmModal = false"
                >
                  {{ t('Revenir au formulaire') }}
                </BrandedButton>
                <slot
                  name="button"
                  :form="formId"
                />
              </div>
            </template>
          </ModalClient>
          <slot
            name="button"
            :form="formId"
          />
        </div>
        <slot />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner, type DataserviceAccessAudienceCondition, type DataserviceAccessAudienceType } from '@datagouv/components-next'
import { RiAddLine } from '@remixicon/vue'
import { computed } from 'vue'
import ModalClient from '../Modal/Modal.client.vue'
import Accordion from '~/components/Accordion/Accordion.global.vue'
import AccordionGroup from '~/components/Accordion/AccordionGroup.global.vue'
import ContactPointSelect from '~/components/ContactPointSelect.vue'
import ProducerSelect from '~/components/ProducerSelect.vue'
import type { DataserviceForm, Owned } from '~/types/types'
import SelectGroup from '~/components/Form/SelectGroup/SelectGroup.vue'

const props = defineProps<{
  harvested?: boolean
  type: 'create' | 'update'
}>()
const dataserviceForm = defineModel<DataserviceForm>({ required: true })

const emit = defineEmits<{
  (event: 'submit'): void
}>()

const { t } = useI18n()

const formId = useId()

const user = useMe()
const config = useRuntimeConfig()

const nameDataserviceAccordionId = useId()
const acronymDataserviceAccordionId = useId()
const addDescriptionAccordionId = useId()
const accessTypeAccordionId = useId()
const addBaseUrlAccordionId = useId()
const addAuthorizationUrlAccordionId = useId()
const machineDocumentationUrlAccordionId = useId()
const technicalDocumentationUrlAccordionId = useId()
const addBusinessUrlAccordionId = useId()
const rateLimitingDataserviceAccordionId = useId()
const availabilityDataserviceAccordionId = useId()
const contactPointAccordionId = useId()

const { getAccessAudienceCondition, getAccessAudienceType } = useAccessAudience()

const ownedOptions = computed<Array<Owned>>(() => {
  return [...user.value.organizations.map(organization => ({ organization, owner: null })), { owner: user.value, organization: null }]
})

const accessAudienceConditions: Array<DataserviceAccessAudienceCondition> = ['yes', 'no', 'under_condition']

const accessAudienceTypes: Array<DataserviceAccessAudienceType> = ['local_authority_and_administration', 'company_and_association', 'private']

const accessAudienceConditionOptions = computed(() => accessAudienceConditions.map(condition => ({
  value: condition,
  label: getAccessAudienceCondition(condition).label,
})))

const machineDocumentationUrlWarningMessage = t(`Il est fortement recommandé d'ajouter une documentation OpenAPI ou Swagger à votre API.`)
const openConfirmModal = ref(false)

const { form, touch, getFirstError, getFirstWarning, injectionKey, validate } = useForm(dataserviceForm, {
  owned: [required()],
  title: [required()],
  description: [required()],
  base_api_url: [url()],
  authorization_request_url: [url()],
  technical_documentation_url: [url()],
  machine_documentation_url: [url()],
  business_documentation_url: [url()],
  private: [],
}, {
  title: [testNotAllowed(config.public.demoServer?.name)],
  description: [minLength(200, t(`Il est recommandé d'avoir une {property} d'au moins {min} caractères.`, { property: t('description'), min: 200 }))],
  machine_documentation_url: [required(machineDocumentationUrlWarningMessage)],
})

onMounted(() => {
  if (props.type === 'update') validate()
})

const accordionState = (key: keyof typeof form.value) => {
  if (getFirstError(key)) return 'error'
  if (getFirstWarning(key)) return 'warning'

  return 'default'
}

function submit() {
  if (validate()) {
    if (dataserviceForm.value.machine_documentation_url || openConfirmModal.value) {
      emit('submit')
      openConfirmModal.value = false
    }
    else {
      openConfirmModal.value = true
    }
  }
}
</script>
