<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ $t('Profile') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="fr-h3 !mb-5">
      {{ $t("Profile") }}
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
          <h2 class="!mb-0 fr-h3">
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
            {{ $t('See public profile') }}
          </BrandedButton>
        </div>
      </div>
    </PaddedContainer>
    <h2 class="uppercase !text-sm !my-5">
      {{ $t('Edit Profile') }}
    </h2>
    <PaddedContainer class="!p-5">
      <fieldset class="fr-grid-row fr-grid-row--gutters">
        <InputGroup
          v-model="form.first_name"
          class="fr-col"
          autocomplete="given-name"
          :label="$t('First name')"
          :required="true"
          :spellcheck="false"
        />
        <InputGroup
          v-model="form.last_name"
          class="fr-col"
          autocomplete="family-name"
          :label="$t('Last name')"
          :required="true"
          :spellcheck="false"
        />
      </fieldset>
      <InputGroup
        v-model="form.about"
        class="fr-col"
        :label="$t('Biography')"
        type="markdown"
      />
      <InputGroup
        v-model="form.website"
        class="fr-col"
        :label="$t('Website')"
        type="url"
      />
      <UploadGroup
        :label="$t('Profile picture')"
        type="drop"
        accept=".jpeg, .jpg, .png"
        :hint-text="$t('Max size: 4Mo. Accepted formats: JPG, JPEG, PNG')"
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
        :label="$t('Roles')"
        :options="allRolesAsString"
        :placeholder="t('Select a role')"
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
          {{ $t('Save') }}
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
          {{ $t('API Key') }}
          <span
            v-if="user.apikey"
            class="fr-hint-text"
          >
            {{ $t('Warning: If you erase your API key you risk to loose acces to {site} services', { site: config.public.title }) }}
          </span>
        </label>
        <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
          <div class="fr-col-12 fr-col-sm">
            <div class="relative">
              <input
                :id="apiKeyId"
                v-model="user.apikey"
                type="password"
                class="fr-input !pr-8"
                disabled
              >
              <div class="absolute right-1 top-1 !mt-0.5 !mr-0.5">
                <CopyButton
                  v-if="user.apikey"
                  :label="$t('Copy API key')"
                  :copied-label="$t('API key copied')"
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
                <span v-if="user.apikey">{{ $t('Regenerate') }}</span>
                <span v-else>{{ $t('Generate') }}</span>
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
                {{ $t('Delete') }}
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
          {{ $t('E-mail address') }}
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
              color="secondary"
              size="xs"
              as="a"
              :href="`${config.public.apiBase}/${config.public.changeEmailPage}`"
              :icon="RiEditLine"
            >
              {{ $t('Change e-mail address') }}
            </BrandedButton>
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
          {{ $t('Password') }}
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
              color="secondary"
              size="xs"
              as="a"
              :href="`${config.public.apiBase}/${config.public.changePasswordPage}`"
              :icon="RiEditLine"
            >
              {{ $t('Change password') }}
            </BrandedButton>
          </div>
        </div>
      </div>
      <BannerAction
        type="danger"
        :title="$t('Delete the account')"
        class="mt-4"
      >
        {{ $t("Be careful, this action can't be reverse.") }}

        <template #button>
          <ModalWithButton
            :title="$t('Are you sure you want to delete this organization ?')"
            size="lg"
          >
            <template #button="{ attrs, listeners }">
              <BrandedButton
                color="danger"
                size="xs"
                :icon="RiDeleteBin6Line"
                v-bind="attrs"
                v-on="listeners"
              >
                {{ $t('Delete') }}
              </BrandedButton>
            </template>
            <template #default>
              <p class="fr-text--bold">
                {{ $t("This action can't be reverse.") }}
              </p>
              <p>{{ $t("All content published with this organization will stay online, with the same URL but in an anonymous form, i.e. without being linked to a data producer.") }}</p>
              <p>{{ $t("If you want to delete your published content too, start by deleting the contents before deleting your account.") }}</p>
            </template>
            <template #footer>
              <div class="flex-1 flex justify-end">
                <BrandedButton
                  color="danger"
                  :disabled="loading"
                  @click="deleteUser"
                >
                  {{ $t("Delete your account") }}
                </BrandedButton>
              </div>
            </template>
          </ModalWithButton>
        </template>
      </BannerAction>
    </PaddedContainer>
  </div>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton, CopyButton } from '@datagouv/components-next'
import { Avatar, type User } from '@datagouv/components-next'
import { RiDeleteBin6Line, RiEditLine, RiEyeLine, RiRecycleLine, RiSaveLine } from '@remixicon/vue'
import { uploadProfilePicture } from '~/api/users'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import SearchableSelect from '~/components/SearchableSelect.vue'

const props = defineProps<{
  user: User
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
      await uploadProfilePicture(profilePicture.value)
    }
    catch {
      toast.error(t(`Your profile picture couldn't be updated !`))
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
    toast.success(t('Profile updated !'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
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

const localePath = useLocalePath()

async function deleteUser() {
  loading.value = true
  try {
    await $api(props.user.id === me.value.id ? '/api/1/me/' : `/api/1/users/${props.user.id}`, {
      method: 'DELETE',
    })
    if (props.user.id === me.value.id) {
      navigateTo(`${config.public.apiBase}/en/logout`, { external: true })
    }
    else {
      toast.success(t('User deleted!'))
      await navigateTo(localePath(`/admin/site/users`), { replace: true })
    }
  }
  finally {
    loading.value = false
  }
}
</script>
