<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ $t('Profil') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="text-2xl font-extrabold text-gray-title mb-5">
      {{ $t("Profil") }}
    </h1>
    <PaddedContainer class="!p-5">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex-none">
          <Avatar
            :user="user"
            :rounded="true"
            :size="80"
          />
        </div>
        <div class="w-full flex-none md:flex-1">
          <h2 class="!mb-0 text-2xl font-bold">
            {{ user.first_name }} {{ user.last_name }}
          </h2>
          <AdminEmail :user />
        </div>
        <div class="flex-none">
          <BrandedButton
            size="xs"
            color="secondary"
            as="a"
            :href="user.page"
            :icon="RiEyeLine"
          >
            {{ $t('Voir le profil public') }}
          </BrandedButton>
        </div>
      </div>
    </PaddedContainer>
    <h2 class="uppercase !text-sm !my-5">
      {{ $t('Éditer le Profil') }}
    </h2>
    <PaddedContainer class="!p-5">
      <fieldset class="fr-grid-row fr-grid-row--gutters">
        <InputGroup
          v-model="form.first_name"
          class="fr-col"
          autocomplete="given-name"
          :label="$t('Prénom')"
          :required="true"
          :spellcheck="false"
        />
        <InputGroup
          v-model="form.last_name"
          class="fr-col"
          autocomplete="family-name"
          :label="$t('Nom')"
          :required="true"
          :spellcheck="false"
        />
      </fieldset>
      <InputGroup
        v-model="form.about"
        class="fr-col"
        :label="$t('Biographie')"
        type="markdown"
      />
      <InputGroup
        v-model="form.website"
        class="fr-col"
        :label="$t('Site Internet')"
        type="url"
      />
      <UploadGroup
        :label="$t('Image de profil')"
        type="drop"
        accept=".jpeg, .jpg, .png"
        :hint-text="$t('Taille max : 4 Mo. Formats acceptés : JPG, JPEG, PNG')"
        :show-label="true"
        @change="setFiles"
      />
      <div
        v-if="imagePreview"
        class="text-align-center"
      >
        <NuxtImg
          :src="imagePreview"
          class="border mx-auto max-h-40"
          loading="lazy"
          alt=""
        />
      </div>
      <SearchableSelect
        v-if="isMeAdmin()"
        v-model="form.roles"
        class="fr-input-group"
        :label="$t('Rôles')"
        :options="allRolesAsString"
        :placeholder="t('Sélectionnez un rôle')"
        :display-value="(option) => humanJoin(option)"
        :get-option-id="(option) => option"
        :multiple="true"
      />
      <div class="flex justify-end">
        <BrandedButton
          size="xs"
          :disabled="loading"
          :icon="RiSaveLine"
          @click="updateUser"
        >
          {{ $t('Sauvegarder') }}
        </BrandedButton>
      </div>
      <div
        v-if="user.id === me.id"
        class="fr-input-group"
      >
        <label
          class="fr-label"
          :for="apiKeyId"
        >
          {{ $t(`Clé d'API`) }}
          <span
            v-if="user.apikey"
            class="fr-hint-text"
          >
            {{ $t(`Attention: Si vous supprimez votre clé d'API vous risquez de perdre l'accès aux services de {site}`, { site: config.public.title }) }}
          </span>
        </label>
        <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
          <div class="fr-col-12 fr-col-sm">
            <div class="relative">
              <input
                :id="apiKeyId"
                :value="user.apikey"
                type="password"
                class="fr-input !pr-8"
                disabled
              >
              <div class="absolute right-1 top-1 !mt-0.5 !mr-0.5">
                <CopyButton
                  v-if="user.apikey"
                  :label="$t(`Copier la clé d'API`)"
                  :copied-label="$t('Clé API copiée')"
                  :text="user.apikey"
                  reverse
                />
              </div>
            </div>
          </div>
          <div class="fr-col-auto flex gap-4">
            <div class="flex-none">
              <BrandedButton
                color="secondary"
                size="xs"
                :disabled="loading"
                :icon="RiRecycleLine"
                @click="regenerateApiKey"
              >
                <span v-if="user.apikey">{{ $t('Regénérer') }}</span>
                <span v-else>{{ $t('Générer') }}</span>
              </BrandedButton>
            </div>
            <div
              v-if="user.apikey"
              class="flex-none"
            >
              <BrandedButton
                color="danger"
                size="xs"
                :disabled="loading"
                :icon="RiDeleteBin6Line"
                @click="deleteApiKey"
              >
                {{ $t('Supprimer') }}
              </BrandedButton>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="user.id === me.id"
        class="fr-input-group"
      >
        <label
          class="fr-label mb-2"
          :for="emailId"
        >
          {{ $t('Adresse e-mail') }}
        </label>
        <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
          <div class="fr-col-12 fr-col-sm-7 fr-col-lg-8 fr-col-xl-9">
            <div class="fr-input-wrap relative">
              <input
                :id="emailId"
                v-model="form.email"
                class="fr-input"
                disabled
                type="text"
              >
            </div>
          </div>
          <div class="fr-col-auto">
            <BrandedButton
              v-if="config.public.changeEmailPage"
              color="secondary"
              size="xs"
              as="a"
              :href="`${config.public.apiBase}/${config.public.changeEmailPage}`"
              :icon="RiEditLine"
              external
            >
              {{ $t(`Changer d'adresse email`) }}
            </BrandedButton>
            <ChangeEmailModal v-else />
          </div>
        </div>
      </div>
      <div
        v-if="user.id === me.id"
        class="fr-input-group"
      >
        <label
          class="fr-label mb-2"
          :for="passwordId"
        >
          {{ $t('Mot de passe') }}
        </label>
        <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
          <div class="fr-col-12 fr-col-sm-7 fr-col-lg-8 fr-col-xl-9">
            <div class="fr-input-wrap relative">
              <input
                :id="passwordId"
                value="**********"
                class="fr-input"
                disabled
                type="password"
              >
            </div>
          </div>
          <div class="fr-col-auto">
            <BrandedButton
              v-if="config.public.changePasswordPage"
              color="secondary"
              size="xs"
              as="a"
              :href="`${config.public.apiBase}/${config.public.changePasswordPage}`"
              :icon="RiEditLine"
              external
            >
              {{ $t('Changer de mot de passe') }}
            </BrandedButton>
            <ChangePasswordModal v-else />
          </div>
        </div>
      </div>
      <BannerAction
        type="danger"
        :title="$t('Supprimer le compte')"
        class="mt-4"
      >
        {{ $t("Attention, cette action ne peut pas être annulée.") }}

        <template #button>
          <DeleteUserModal :user />
        </template>
      </BannerAction>
    </PaddedContainer>
  </div>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton, CopyButton } from '@datagouv/components-next'
import { Avatar, type User } from '@datagouv/components-next'
import { RiDeleteBin6Line, RiEditLine, RiEyeLine, RiRecycleLine, RiSaveLine } from '@remixicon/vue'
import DeleteUserModal from './DeleteUserModal.vue'
import ChangePasswordModal from './ChangePasswordModal.vue'
import ChangeEmailModal from './ChangeEmailModal.vue'
import { uploadProfilePicture } from '~/api/users'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import SearchableSelect from '~/components/SearchableSelect.vue'

const props = defineProps<{
  user: User
}>()

const emits = defineEmits<{
  refresh: []
}>()

const me = useMe()
const config = useNuxtApp().$config
const { toast } = useToast()
const { t } = useI18n()
const { $api } = useNuxtApp()

const apiKeyId = useId()
const emailId = useId()
const passwordId = useId()

const loading = ref(false)

const profilePicture = ref<File | null>(null)

const { data: allRoles } = await useAPI<Array<{ name: string }>>('/api/1/users/roles')
const allRolesAsString = computed(() => (allRoles.value || []).map(r => r.name))

const { form } = useForm(props.user, {}, {})
watchEffect(() => {
  // Why this is needed?
  if (form.value.about === null) {
    form.value.about = ''
  }
})

const setFiles = (files: Array<File>) => {
  profilePicture.value = files[0]
}

const imagePreview = computed(() => {
  if (!profilePicture.value) return null
  if (typeof profilePicture.value === 'string') return profilePicture.value
  return URL.createObjectURL(profilePicture.value)
})

async function updateUser() {
  loading.value = true
  if (profilePicture.value) {
    try {
      await uploadProfilePicture(profilePicture.value, me.value.id === props.user.id ? null : props.user)
    }
    catch {
      toast.error(t(`Votre image de profil n'a pas pu être téléversée !`))
    }
  }
  try {
    await $api(me.value.id === props.user.id ? `/api/1/me` : `/api/1/users/${props.user.id}`, {
      method: 'PUT',
      body: {
        first_name: form.value.first_name,
        last_name: form.value.last_name,
        about: form.value.about,
        website: form.value.website,
        roles: isMeAdmin() ? form.value.roles : props.user.roles,
      },
    })
    toast.success(t('Profil mis à jour !'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    emits('refresh')
  }
  finally {
    loading.value = false
  }
}

async function regenerateApiKey() {
  loading.value = true
  try {
    await $api<{ apikey: string }>('/api/1/me/apikey', {
      method: 'POST',
    })
    loadMe(me)
  }
  finally {
    loading.value = false
  }
}

async function deleteApiKey() {
  loading.value = true
  try {
    await $api('/api/1/me/apikey', {
      method: 'DELETE',
    })
    loadMe(me)
  }
  finally {
    loading.value = false
  }
}
</script>
