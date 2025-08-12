<template>
  <AdminTable>
    <thead>
      <AdminTableTh scope="col">
        {{ t("Nom du point de contact") }}
      </AdminTableTh>
      <AdminTableTh class="w-44">
        {{ t("Rôle") }}
      </AdminTableTh>
      <AdminTableTh>
        {{ t("E-mail du contact") }}
      </AdminTableTh>
      <AdminTableTh
        scope="col"
      >
        {{ t("Url du point de contact") }}
      </AdminTableTh>
      <AdminTableTh
        class="w-32"
        scope="col"
      >
        {{ t("Action") }}
      </AdminTableTh>
    </thead>
    <tbody>
      <tr
        v-for="contactPoint in contactPoints"
        :key="contactPoint.id"
      >
        <td class="font-bold">
          {{ contactPoint.name }}
        </td>
        <td>
          <AdminBadge
            size="xs"
            type="secondary"
          >
            {{ getRoleLabel(contactPoint) }}
          </AdminBadge>
        </td>
        <td>
          {{ contactPoint.email }}
        </td>
        <td>
          <div class="break-all truncate">
            {{ contactPoint.contact_form }}
          </div>
        </td>
        <td>
          <ModalWithButton
            :title="$t('Éditer le point de contact')"
            size="lg"
            @open="newContactForm = contactPoint"
            @close="newContactForm = null"
          >
            <template #button="{ attrs, listeners }">
              <BrandedButton
                color="secondary-softer"
                :icon="RiPencilLine"
                icon-only
                size="xs"
                :title="$t('Modifier')"
                keep-margins-even-without-borders
                v-bind="attrs"
                v-on="listeners"
              >
                {{ $t('Modifier') }}
              </BrandedButton>
            </template>
            <form class="block space-y-4">
              <RequiredExplanation />
              <InputGroup
                v-model="newContactForm.name"
                required
                :label="t('Nom')"
                :placeholder="t('ex: le nom du service')"
                :has-error="!!getFirstError('name')"
                :error-text="getFirstError('name')"
                @blur="touch('name')"
              />
              <SelectGroup
                v-model="newContactForm.role"
                :options
                required
                :label="t('Rôle')"
                @blur="touch('role')"
              />
              <InputGroup
                v-model="newContactForm.email"
                type="email"
                :label="t('E-mail')"
                placeholder="contact@organisation.org"
                :has-error="!!getFirstError('email')"
                :error-text="getFirstError('email')"
                @blur="touch('email')"
              />
              <InputGroup
                v-model="newContactForm.contact_form"
                type="url"
                :label="t('Lien')"
                placeholder="https://..."
                :has-error="!!getFirstError('contact_form')"
                :error-text="getFirstError('contact_form')"
                @blur="touch('contact_form')"
              />
            </form>
            <template #footer="{ close }">
              <div class="flex-1 flex justify-end">
                <BrandedButton
                  color="primary"
                  :loading
                  @click="updateContactPoint(close)"
                >
                  {{ $t('Sauvegarder') }}
                </BrandedButton>
              </div>
            </template>
          </ModalWithButton>
        </td>
      </tr>
    </tbody>
  </AdminTable>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import type { ContactPoint, ContactType, Organization } from '@datagouv/components-next'
import { RiPencilLine } from '@remixicon/vue'
import AdminBadge from '~/components/AdminBadge/AdminBadge.vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import SelectGroup from '~/components/Form/SelectGroup/SelectGroup.vue'

const props = defineProps<{
  contactPoints: Array<ContactPoint>
  organization: Organization
}>()

const emit = defineEmits<{
  (event: 'refresh'): void
}>()

const { $api } = useNuxtApp()

const { t } = useI18n()
const { toast } = useToast()

const { form: newContactForm, getFirstError, touch, validate } = useForm({
  ...defaultContactForm,
  id: '',
} as ContactPoint, {
  id: [required()],
  name: [required()],
  email: [email(), requiredIfFalsy('contact_form', t(`Une adresse e-mail est requise si un lien n'est pas fourni`))],
  contact_form: [url(), requiredIfFalsy('email', t(`Un lien est requis si une adresse e-mail n'est pas fournie`))],
  role: [required()],
}, {})

const loading = ref(false)

const roleKey = '/api/1/contacts/roles/'
const { data: rolesList } = await useAPI<Array<ContactType>>(roleKey, {
  key: roleKey,
  getCachedData: getDataFromSSRPayload,
})

const options = computed(() => rolesList.value?.map(r => ({
  label: r.label,
  value: r.id,
})) ?? [])

function getRoleLabel(contact: ContactPoint) {
  return rolesList.value?.find(role => role.id === contact.role)?.label
}

async function updateContactPoint(closeModal: () => void) {
  if (!await validate()) {
    return
  }
  loading.value = true
  try {
    await saveContactPoint($api, props.organization, newContactForm.value)
    emit('refresh')
    closeModal()
  }
  finally {
    loading.value = false
  }

  toast.success(t('Point de contact mis à jour !'))
}
</script>
