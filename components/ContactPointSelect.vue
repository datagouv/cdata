<template>
  <div>
    <div>
      <SearchableSelect
        v-model="contact"
        :options="contactsWithNewOption"
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
      v-if="contact && !('id' in contact)"
      class="fr-fieldset__element grid grid-cols-2 gap-3 mt-2"
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
        @blur="touch('email')"
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
        @blur="touch('contact_form')"
      />
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
import { useI18n } from 'vue-i18n'
import type { Organization } from '@datagouv/components-next'
import SelectGroup from '~/components/Form/SelectGroup/SelectGroup.vue'
import InputGroup from '~/components/InputGroup/InputGroup.vue'
import type { ContactPoint, ContactPointInForm, NewContactPoint, PaginatedArray } from '~/types/types'

const contact = defineModel<ContactPointInForm | null>()

const props = defineProps<{
  parentFormKey?: InjectionKey<FormRegister>
  organization: Organization
  showAttributions?: boolean
  errorText?: string | null
  warningText?: string | null
}>()

type ContactType = { id: string, label: string }

const { t } = useI18n()

const { form: newContactForm, getFirstError, getFirstWarning, touch, validate } = useForm({
  ...defaultContactForm,
} as NewContactPoint, {
  name: [required()],
  email: [email()],
  contact_form: [url()],
  role: [required()],
}, {})

if (props.parentFormKey) {
  const { registerSubform, unregisterSubform } = inject(props.parentFormKey) as FormRegister
  onMounted(() => registerSubform('contact_point', validate))

  onBeforeUnmount(() => unregisterSubform('contact_point'))
}

watchEffect(() => {
  if (contact.value && !('id' in contact.value)) {
    contact.value = newContactForm.value
  }
})

const contactsUrl = computed(() => `/api/1/organizations/${props.organization.id}/contacts/`)
const { data: contacts, status } = await useAPI<PaginatedArray<ContactPoint>>(contactsUrl, {
  key: contactsUrl.value,
  getCachedData: getDataFromSSRPayload,
})

const roleKey = '/api/1/contacts/roles/'
const { data: rolesList, status: rolesStatus } = await useAPI<Array<ContactType>>(roleKey, {
  key: roleKey,
  getCachedData: getDataFromSSRPayload,
})
const loading = computed(() => status.value === 'pending' || rolesStatus.value === 'pending')

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
</script>
