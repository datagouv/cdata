<template>
  <div class="flex">
    <Sidemenu
      class="w-5/12 hidden lg:block"
      :button-text="$t('Help')"
      :on-right="true"
      :fixed="true"
    >
      <template #title>
        <span
          class="fr-icon--sm fr-icon-question-line"
          aria-hidden="true"
        />
        {{ $t('Help') }}
      </template>
      <AccordionGroup :with-icon="true">
        <Accordion
          :id="nameDataserviceAccordionId"
          :title="t('Name your API')"
          :state="accordionState('title')"
        >
          <p class="fr-m-0">
            {{ t('Give your API a relevant and explicit name to reflect its function or application domain. A good name helps users search for and identify the API easily.') }}
          </p>
        </Accordion>
        <Accordion
          :id="acronymDataserviceAccordionId"
          :title="t('Add an acronym to the API')"
          :state="accordionState('acronym')"
        >
          <p class="fr-m-0">
            {{ t('You have the option to add an acronym to your API. The letters that make up this acronym do not need to be separated by periods.') }}
          </p>
        </Accordion>
        <Accordion
          :id="addDescriptionAccordionId"
          :title="t('Write a good description')"
          :state="accordionState('description')"
        >
          <p class="fr-m-0">
            {{ t("Write a clear and precise description of the API. Users need to understand the purpose of the API, the data provided, the scope covered (is the data exhaustive, are there any gaps?), the frequency of data updates, as well as the parameters with which they can make a call.") }}
          </p>
          <SimpleBanner
            v-if="getFirstWarning('description')"
            class="font-bold mt-2"
            type="warning"
          >
            {{ getFirstWarning("description") }}
          </SimpleBanner>
        </Accordion>
        <Accordion
          :id="addBaseUrlAccordionId"
          :title="t('Define the correct link to the API')"
          :state="accordionState('base_api_url')"
        >
          <p class="fr-m-0">
            {{ t("The base URL of an API is the common entry point for all requests, often consisting of a domain or server address. It serves as the foundation to which specific paths (endpoints) are added to access the various resources of the API.") }}
          </p>
        </Accordion>
        <Accordion
          :id="machineDocumentationUrlAccordionId"
          :title="t('Add a link to the machine documentation')"
          :state="accordionState('machine_documentation_url')"
        >
          <p class="fr-m-0">
            {{ t("Ideally, provide an OpenAPI (swagger) link that allows developers to explore the endpoints, see the available methods, and test requests directly from the documentation. In the case of geographic services, you can provide a link to the service with a GetCapabilities request to obtain the service's metadata.") }}
          </p>
        </Accordion>
        <Accordion
          :id="technicalDocumentationUrlAccordionId"
          :title="t('Add a link to the technical documentation')"
          :state="accordionState('machine_documentation_url')"
        >
          <p class="fr-m-0">
            {{ t("Add access to the general technical documentation of the API and indicate the integration steps.") }}
          </p>
        </Accordion>
        <Accordion
          :id="rateLimitingDataserviceAccordionId"
          :title="t('Set the rate limiting')"
          :state="accordionState('rate_limiting')"
        >
          <p class="fr-m-0">
            {{ t('You can specify the rate limiting for your API.') }}
          </p>
        </Accordion>
        <Accordion
          :id="availabilityDataserviceAccordionId"
          :title="t('Add the availability')"
          :state="accordionState('availability')"
        >
          <p class="fr-m-0">
            {{ t('Specify the mean availability of your dataservice. Value should be a percentage.') }}
          </p>
        </Accordion>
        <Accordion
          v-if="form.owned?.organization"
          :id="contactPointAccordionId"
          :title="$t('Define a point of contact')"
          :state="accordionState('contact_points')"
        >
          <p class="fr-m-0">
            {{ $t("Specify a contact point, such as an email or a link to a form, so users can reach you in case of issues or for questions.") }}
          </p>
        </Accordion>
        <Accordion
          :id="accessTypeAccordionId"
          :title="$t('Select an access type')"
          :state="accordionState('access_type')"
        >
          <p class="fr-m-0">
            {{ $t("Please indicate whether the dataservice is freely accessible or whether a user requires a token to access the data.") }}
          </p>
          <SimpleBanner
            v-if="getFirstWarning('access_type')"
            class="font-bold mt-2"
            type="warning"
          >
            {{ getFirstWarning("access_type") }}
          </SimpleBanner>
        </Accordion>
        <Accordion
          :id="addAuthorizationUrlAccordionId"
          :title="t('Add a link to the authorization')"
          :state="accordionState('authorization_request_url')"
        >
          <p class="fr-m-0">
            {{ t("If your API is restricted access, please add the link to the access request form. Are you an administration? The Datapass solution allows you to easily create and manage access request forms for data.") }}
          </p>
        </Accordion>
        <Accordion
          :id="addBusinessUrlAccordionId"
          :title="t('Add a link to the business documentation')"
          :state="accordionState('business_documentation_url')"
        >
          <p class="fr-m-0">
            {{ t("The business documentation of your API that explains its capabilities and use cases, in addition to the technical documentation.") }}
          </p>
        </Accordion>
      </AccordionGroup>
    </Sidemenu>
    <form
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
              {{ t('What is a dataservice?') }}
            </p>
            <p class="m-0 text-xs/5">
              {{ t('A dataservice is a computer tool that allows a website or software to communicate with another computer and exchange data.') }}
            </p>
          </div>
        </SimpleBanner>
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
              {{ $t("Producer") }}
            </h2>
          </legend>
          <div class="fr-fieldset__element">
            <ProducerSelect
              v-model="form.owned"
              :label="t('Check the identity with which you want to publish')"
              :options="ownedOptions"
              :error-text="getFirstError('owned')"
              :warning-text="getFirstWarning('owned')"
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
              :aria-describedby="nameDataserviceAccordionId"
              :label="t('Dataservice name')"
              :required="true"
              :has-error="!!getFirstError('title')"
              :has-warning="!!getFirstWarning('title')"
              :error-text="getFirstError('title')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="acronymDataserviceAccordionId"
            @blur="touch('acronym')"
          >
            <InputGroup
              v-model="form.acronym"
              :aria-describedby="acronymDataserviceAccordionId"
              :label="t('Acronym')"
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
              :label="$t('Description')"
              :required="true"
              type="markdown"
              :has-error="!!getFirstError('description')"
              :has-warning="!!getFirstWarning('description')"
              :error-text="getFirstError('description')"
              @change="touch('description')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addBaseUrlAccordionId"
            @blur="touch('base_api_url')"
          >
            <InputGroup
              v-model="form.base_api_url"
              :aria-describedby="addBaseUrlAccordionId"
              :label="t('Dataservice Base URL')"
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
              :label="t('Dataservice machine description URL')"
              type="url"
              placeholder="https://..."
              :required="false"
              :has-error="!!getFirstError('machine_documentation_url')"
              :has-warning="!!getFirstWarning('machine_documentation_url')"
              :error-text="getFirstError('machine_documentation_url')"
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
              :label="t('Dataservice technical description URL')"
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
              :label="t('Rate limiting')"
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
              :label="t('Availability')"
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
          v-if="form.owned?.organization"
          class="fr-fieldset"
          aria-labelledby="description-legend"
        >
          <legend
            id="description-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-0">
              {{ harvested ? t("Attributions and Contact points") : t("Contact points") }}
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
            />
            <ContactPointSelect
              v-if="form.contact_points.length === 0"
              v-model="form.contact_points[0]"
              class="pt-3"
              :organization="form.owned?.organization"
              :show-attributions="harvested"
            />
            <BrandedButton
              class="mt-3"
              type="button"
              color="primary-soft"
              size="xs"
              :icon="RiAddLine"
              @click="form.contact_points.push({ ...defaultContactForm })"
            >
              {{ harvested ? t('New Attribution') : t('New Contact') }}
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
              {{ $t("Access") }}
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
              :label="t('Access type')"
              :options="[
                { value: 'open', label: t('Open') },
                { value: 'open_with_account', label: t('Open with account') },
                { value: 'restricted', label: t('Restricted') },
              ]"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addAuthorizationUrlAccordionId"
            @blur="touch('authorization_request_url')"
          >
            <InputGroup
              v-model="form.authorization_request_url"
              :aria-describedby="addAuthorizationUrlAccordionId"
              :label="t('Dataservice authorization request URL')"
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
              :label="t('Dataservice business documentation URL')"
              type="url"
              placeholder="https://..."
              :required="false"
              :has-error="!!getFirstError('business_documentation_url')"
              :has-warning="!!getFirstWarning('business_documentation_url')"
              :error-text="getFirstError('business_documentation_url')"
            />
          </LinkedToAccordion>
        </fieldset>
        <div
          v-if="type === 'update'"
          class="fr-checkbox-group fr-checkbox-group--sm mb-4"
        >
          <input
            id="checkboxes-hint-el-sm-1"
            v-model="dataserviceForm.private"
            name="checkboxes-hint-el-sm-1"
            type="checkbox"
            aria-describedby="checkboxes-hint-el-sm-1-messages"
          >
          <label
            class="fr-label"
            for="checkboxes-hint-el-sm-1"
          >
            {{ t('Switch to draft mode') }}
            <span class="fr-hint-text">{{ t('The dataservice will only be visible to members of your organization.') }}</span>
          </label>
          <div
            id="checkboxes-hint-el-sm-1-messages"
            class="fr-messages-group"
            aria-live="assertive"
          />
        </div>
        <div class="fr-grid-row fr-grid-row--right">
          <slot name="button" />
        </div>
        <slot />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner } from '@datagouv/components-next'
import { RiAddLine } from '@remixicon/vue'
import { computed } from 'vue'
import Accordion from '~/components/Accordion/Accordion.vue'
import AccordionGroup from '~/components/Accordion/AccordionGroup.vue'
import ContactPointSelect from '~/components/ContactPointSelect.vue'
import ProducerSelect from '~/components/ProducerSelect.vue'
import type { DataserviceForm, Owned } from '~/types/types'

const props = defineProps<{
  harvested?: boolean
  type: 'create' | 'update'
}>()
const dataserviceForm = defineModel<DataserviceForm>({ required: true })

const emit = defineEmits<{
  (event: 'submit'): void
}>()

const { t } = useI18n()

const user = useMe()

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

const ownedOptions = computed<Array<Owned>>(() => {
  return [...user.value.organizations.map(organization => ({ organization, owner: null })), { owner: user.value, organization: null }]
})

const { form, touch, getFirstError, getFirstWarning, validate } = useForm(dataserviceForm, {
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
  description: [minLength(200, t(`It's advised to have a {property} of at least {min} characters.`, { property: t('description'), min: 200 }))],
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
    emit('submit')
  }
};
</script>
