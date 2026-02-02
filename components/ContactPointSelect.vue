<template>
  <div>
    <div>
      <SearchableSelect
        ref="contactSelect"
        v-model="contact"
        :options="contactsWithNewOption"
        :suggest="suggestContactPoint"
        :label="showAttributions ? t(`Choisissez l'attribution avec laquelle vous voulez publier`) : t('Choisissez un point de contact')"
        :placeholder="showAttributions ? t('Choisissez une attribution') : t('Sélectionner un contact')"
        :display-value="(option) => 'id' in option ? (option.name || option.email || $t('Inconnu')) : (showAttributions ? t('Nouvelle attribution') : t('Nouveau point de contact'))"
        :get-option-id="(option) => 'id' in option ? option.id : 'new'"
        :multiple="false"
        :loading
        :error-text
        :warning-text
      >
        <template #option="{ option }">
          <span v-if="'id' in option">
            <template v-if="option.name">
              {{ option.name }} <template v-if="option.email">({{ option.email }})</template>
            </template>
            <template v-else-if="option.email">
              {{ option.email }}
            </template>
            <template v-else>
              {{ $t('Inconnu') }}
            </template>
            <AdminBadge
              v-if="showAttributions && getRole(option.role)"
              size="xs"
              type="primary"
              class="ml-1"
            >
              {{ getRole(option.role)?.label }}
            </AdminBadge>
          </span>
          <span v-else-if="showAttributions">
            {{ t('Nouvelle attribution') }}
          </span>
          <span v-else>
            {{ t('Nouveau point de contact') }}
          </span>
        </template>
      </SearchableSelect>
    </div>
    <div
      v-if="showForm"
      class="p-3 bg-gray-some grid grid-cols-2 gap-3 mt-2"
    >
      <SelectGroup
        v-if="showAttributions"
        v-model="newContactForm.role"
        :options
        class="mb-0"
        required
        :label="t('Rôle')"
        :has-error="!!getFirstError('role')"
        :has-warning="!!getFirstWarning('role')"
        :error-text="getFirstError('role')"
        @blur="touch('role')"
      />
      <InputGroup
        v-model="newContactForm.name"
        class="mb-0"
        :class="{ 'col-span-2': !showAttributions }"
        required
        :label="t('Nom')"
        :placeholder="$t('ex: le nom du service')"
        :has-error="!!getFirstError('name')"
        :has-warning="!!getFirstWarning('name')"
        :error-text="getFirstError('name')"
        @blur="touch('name')"
      />
      <InputGroup
        v-model="newContactForm.email"
        class="mb-0"
        type="email"
        :label="t('E-mail')"
        placeholder="contact@organisation.org"
        :has-error="!!getFirstError('email')"
        :has-warning="!!getFirstWarning('email')"
        :error-text="getFirstError('email')"
        @blur="touchEmailAndForm"
      />
      <InputGroup
        v-model="newContactForm.contact_form"
        class="mb-0"
        type="url"
        :label="t('Lien')"
        placeholder="https://..."
        :has-error="!!getFirstError('contact_form')"
        :has-warning="!!getFirstWarning('contact_form')"
        :error-text="getFirstError('contact_form')"
        @blur="touchEmailAndForm"
      />
      <div>
        <BrandedButton
          class="mt-3"
          type="button"
          color="primary"
          size="xs"
          :icon="RiSaveLine"
          :loading="isLoading"
          @click="save"
        >
          {{ t('Enregistrer') }}
        </BrandedButton>
      </div>
    </div>
    <div
      v-else
      class="mt-2 fr-fieldset__element"
    >
      <p
        v-if="showAttributions && contact && getRole(contact.role)"
        class="flex items-center gap-1 mb-2"
      >
        {{ t("Rôle:") }}
        <AdminBadge
          size="sm"
          type="primary"
        >
          {{ getRole(contact.role)?.label }}
        </AdminBadge>
      </p>
      <p
        v-if="contact?.email"
        class="mb-2"
      >
        {{ t("E-mail de contact :") }} {{ contact.email }}
      </p>
      <p
        v-if="contact?.contact_form"
        class="mb-2"
      >
        {{ t("URL de Contact :") }} {{ contact.contact_form }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BrandedButton, SelectGroup } from '@datagouv/components-next'
import type { ContactPoint, ContactPointRole, Organization, OrganizationReference } from '@datagouv/components-next'
import { RiSaveLine } from '@remixicon/vue'
import InputGroup from '~/components/InputGroup/InputGroup.vue'
import type { ContactPointInForm, NewContactPoint, PaginatedArray } from '~/types/types'

const contact = defineModel<ContactPointInForm | null>()

const props = defineProps<{
  organization: Organization | OrganizationReference
  showAttributions?: boolean
  errorText?: string | null
  warningText?: string | null
}>()

const { t } = useTranslation()
const { $api } = useNuxtApp()
const isLoading = ref(false)

const contactSelectRef = useTemplateRef('contactSelect')

const { form: newContactForm, getFirstError, getFirstWarning, touch, validate } = useForm({
  ...defaultContactForm,
} as NewContactPoint, {
  name: [required()],
  email: [email(), requiredIfFalsy('contact_form', t(`Une adresse e-mail est requise si un lien n'est pas fourni`))],
  contact_form: [url(), requiredIfFalsy('email', t(`Un lien est requis si une adresse e-mail n'est pas fournie`))],
  role: [required()],
}, {})

const showForm = computed(() => contact.value && !('id' in contact.value))

watchEffect(() => {
  if (showForm.value) {
    contact.value = newContactForm.value
  }
})

const contactsUrl = computed(() => `/api/1/organizations/${props.organization.id}/contacts/`)
const { data: contacts, status } = await useAPI<PaginatedArray<ContactPoint>>(contactsUrl, {
  key: contactsUrl.value,
  getCachedData: getDataFromSSRPayload,
})

const roleKey = '/api/1/contacts/roles/'
const { data: rolesList, status: rolesStatus } = await useAPI<Array<ContactPointRole>>(roleKey, {
  key: roleKey,
  getCachedData: getDataFromSSRPayload,
})
const loading = computed(() => isLoading.value || status.value === 'pending' || rolesStatus.value === 'pending')

const options = computed(() => rolesList.value?.map(r => ({
  label: r.label,
  value: r.id,
})) ?? [])

function getRole(role: string) {
  return rolesList.value?.find(r => r.id === role)
}

const contactsWithNewOption = computed<Array<ContactPointInForm>>(() => {
  const attributions = [...contacts.value?.data ?? [], newContactForm.value]
  return props.showAttributions ? attributions : attributions.filter(c => c.role === 'contact')
})

async function suggestContactPoint(query: string): Promise<Array<ContactPoint>> {
  return await $api<Array<ContactPoint>>(`/api/1/organizations/${props.organization.id}/contacts/suggest/`, {
    query: {
      q: query,
      size: 10,
    },
  })
}

function touchEmailAndForm() {
  touch('email')
  touch('contact_form')
}

async function save() {
  if (!validate()) return
  if (!contact.value) {
    console.error('[ContactPointSelect] Cannot save: contact is null or undefined')
    return
  }
  if ('id' in contact.value) {
    console.error('[ContactPointSelect] Cannot save: contact already has an id, expected a new contact')
    return
  }
  isLoading.value = true
  try {
    const newContact = await newContactPoint($api, props.organization, contact.value)
    if (contactSelectRef.value) {
      await contactSelectRef.value.fetchSuggestsQuery(newContact.name)
      contact.value = newContact
    }
  }
  finally {
    isLoading.value = false
  }
}
</script>
