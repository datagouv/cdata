<template>
  <FormWithAccordions
    :form-info
    @submit.prevent="submit"
  >
    <SimpleBanner
      v-if="showWell"
      type="primary"
      class="mb-4 flex items-center space-x-5"
    >
      <NuxtImg
        src="/illustrations/organization.svg"
        loading="lazy"
        class="size-14 shrink-0"
        alt=""
      />
      <div class="w-full">
        <p class="font-bold mb-1">
          {{ t(`Qu'est-ce qu'une organisation ?`) }}
        </p>
        <p class="m-0 text-xs/5">
          {{ t(`Une organisation est une entité dans laquelle de nombreux utilisateurs peuvent collaborer. Les jeux de données publiés sous l'organisation peuvent être édités par ses membres.`) }}
        </p>
      </div>
    </SimpleBanner>

    <slot name="top" />

    <RequiredExplanation />
    <FormFieldset :legend="$t('Description')">
      <FieldsetElement form-key="name">
        <InputGroup
          v-model="organization.name"
          class="mb-3"
          :label="t('Nom')"
          :required="true"
          :has-error="!!getFirstError('name')"
          :has-warning="!!getFirstWarning('name')"
          :error-text="getFirstError('name')"
        />
        <template #accordion>
          <HelpAccordion :title="$t('Nommez votre organisation')">
            <p class="fr-m-0">
              {{ $t("Le nom public de votre organisation.") }} <br>
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>
      <FieldsetElement form-key="acronym">
        <InputGroup
          v-model="organization.acronym"
          :label="t('Acronyme')"
        />
        <template #accordion>
          <HelpAccordion :title="$t('Choisir un acronyme')">
            <p class="fr-m-0">
              {{ $t("L'acronyme de votre organisation, s'il existe.") }} <br>
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>
      <FieldsetElement form-key="business_number_id">
        <InputGroup
          v-model="organization.business_number_id"
          :label="t('Numéro SIRET')"
          :has-error="!!getFirstError('business_number_id')"
          :has-warning="!!getFirstWarning('business_number_id')"
          :error-text="getFirstError('business_number_id')"
        />
        <ClientOnly>
          <div
            v-if="checkOrga.exists !== null"
            class="fr-col mx-2 mb-2 bg-gray-lower text-center p-4"
          >
            <div v-if="checkOrga.exists">
              <p class="m-0 text-sm font-bold">
                {{ t('Le SIRET n°{number} correspond', { number: organization.business_number_id ?? '' }) }}
              </p>
              <p class="m-0 text-xs">
                {{ checkOrga.name }}
              </p>
              <OwnerType
                class="justify-center"
                :type="checkOrga.type"
                color="black"
                size="xs"
              />
            </div>
            <div v-else>
              <p>{{ t('Aucune organisation ne correspond à ce SIRET sur annuaire-entreprises.data.gouv.fr') }}</p>
            </div>
          </div>
        </ClientOnly>
        <template #warning>
          <SimpleBanner
            v-if="organizationsWithSameSiret?.total"
            class="p-4 mt-3 text-warning-dark"
            type="warning"
          >
            <div class="flex items-center gap-1">
              <RiAlertLine class="size-4" /> <span>{{
                t('Une organisation avec ce SIRET existe déjà sur {site} | {n} organisations avec ce SIRET existent déjà sur {site}', { site: config.public.title, n: organizationsWithSameSiret.total })
              }}</span>
            </div>
            <ul class="text-sm list-none p-0">
              <li
                v-for="org in organizationsWithSameSiret.data"
                :key="org.id"
              >
                <CdataLink
                  :href="org.page"
                  class="link text-gray-plain"
                >
                  <OrganizationNameWithCertificate
                    :show-type="false"
                    :organization="org"
                  />
                </CdataLink>
              </li>
            </ul>
          </SimpleBanner>
        </template>
        <template #accordion>
          <HelpAccordion :title="$t('Pourquoi fournir un numéro SIRET ?')">
            <p class="fr-m-0">
              {{ t("Un numéro SIRET nous permettra d’attribuer un type à votre organisation (administrations, collectivités, entreprises etc.) et facilitera votre certification. Le numéro doit faire 14 chiffres.") }} <br>
              {{ t("Veuillez noter que toutes les administrations ont un numéro SIRET.") }} <br>
              {{ t("Vous pouvez trouver votre SIRET sur ") }}<a
                class="underline"
                href="https://annuaire-entreprises.data.gouv.fr/"
                target="_blank"
              >{{ t("l’Annuaire des Entreprises.") }}</a>
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>
      <FieldsetElement form-key="description">
        <InputGroup
          v-model="organization.description"
          :label="t('Description')"
          :required="true"
          type="markdown"
          :has-error="!!getFirstError('description')"
          :has-warning="!!getFirstWarning('description')"
          :error-text="getFirstError('description')"
          @change="touch('description')"
        />
        <template #accordion>
          <HelpAccordion :title="$t('Écrire une bonne description')">
            <p class="fr-m-0">
              {{ $t("Veuillez indiquer ici ce que votre organisation fait et quelle mission elle accomplit. Ajoutez toutes les informations qui permettront aux utilisateurs de vous contacter : adresse e-mail, adresse postale, compte Twitter, etc.") }} <br>
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>
      <FieldsetElement form-key="url">
        <InputGroup
          v-model="organization.url"
          :label="t('Site Internet')"
          type="url"
          :has-error="!!getFirstError('url')"
          :has-warning="!!getFirstWarning('url')"
          :error-text="getFirstError('url')"
        />
        <template #accordion>
          <HelpAccordion :title="$t('Indiquer un site web')">
            <p class="fr-m-0">
              {{ $t("Si votre organisation a un site web, veuillez fournir son URL.") }} <br>
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>
    </FormFieldset>
    <FormFieldset :legend="$t('Logo')">
      <FieldsetElement form-key="logo">
        <UploadGroup
          :label="t('Logo')"
          :title="t('Logo')"
          :hint-text="$t('Taille max : 4 Mo. Formats acceptés : JPG, JPEG, PNG')"
          accept=".jpeg, .jpg, .png"
          :is-valid="!!file"
          :valid-text="t('Votre fichier est valide')"
          @change="addFiles"
        />
        <div
          v-show="imagePreview"
          class="w-full flex justify-center"
        >
          <img
            :src="imagePreview"
            class="fr-col mx-2 mb-2"
            width="300px"
            alt=""
          >
        </div>
        <template #accordion>
          <HelpAccordion :title="$t('Choisir le bon logo')">
            <p class="fr-m-0">
              {{ $t(`Si votre organisation a un logo ou une photo de profil, veuillez la téléverser ici. Pour téléverser un logo, cliquez sur le bouton "Choisir un fichier à partir de votre ordinateur". Les formats d'image suivants sont acceptés : png, jpg/jpeg.`) }} <br>
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>
    </FormFieldset>
    <SearchableSelect
      v-if="isMeAdmin() && 'badges' in organization"
      v-model="newBadges"
      :label="$t('Badges')"
      :placeholder="$t(`Associer des badges à l'organisation…`)"
      class="mb-6"
      :options="badges"
      :get-option-id="(badge) => (badgesLabels ?? {})[badge.kind]"
      :display-value="(badges) => badges ? humanJoin(badges.map(b => (badgesLabels ?? {})[b.kind])) : ''"
      :multiple="true"
    />
    <Alert
      v-if="errors.length"
      type="error"
      class="fr-mt-n2w fr-mb-2w"
    >
      <template #title>
        {{ t("Une erreur est survenue | Des erreurs sont survenues", errors.length) }}
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
    <div
      class="fr-grid-row"
      :class="{ 'fr-grid-row--right': type === 'update', 'justify-between': type === 'create' }"
    >
      <BrandedButton
        v-if="type === 'create'"
        color="secondary"
        @click="$emit('previous')"
      >
        {{ $t('Précédent') }}
      </BrandedButton>
      <BrandedButton
        type="submit"
        color="primary"
      >
        {{ submitLabel }}
      </BrandedButton>
    </div>
    <slot />
  </FormWithAccordions>
</template>

<script setup lang="ts">
import { ASSOCIATION, COMPANY, LOCAL_AUTHORITY, PUBLIC_SERVICE, BrandedButton, OwnerType, SimpleBanner, OrganizationNameWithCertificate } from '@datagouv/components-next'
import type { Badge, NewOrganization, Organization, OrganizationTypes } from '@datagouv/components-next'
import { RiAlertLine } from '@remixicon/vue'
import { asyncComputed } from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'
import Alert from '~/components/Alert/Alert.vue'
import FieldsetElement from '~/components/Form/FieldsetElement.vue'
import FormFieldset from '~/components/Form/FormFieldset.vue'
import HelpAccordion from '~/components/Form/HelpAccordion.vue'
import InputGroup from '~/components/InputGroup/InputGroup.vue'
import RequiredExplanation from '~/components/RequiredExplanation/RequiredExplanation.vue'
import UploadGroup from '~/components/UploadGroup/UploadGroup.vue'
import type { PaginatedArray } from '~/types/types'

const props = withDefaults(defineProps<{
  type: 'create' | 'update'
  errors: Array<string>
  submitLabel: string
  loading?: boolean
  showLegend?: boolean
  showWell?: boolean
}>(), {
  loading: false,
  showLegend: true,
  showWell: true,
})

const organization = defineModel<NewOrganization | Organization>({ required: true })

const emit = defineEmits<{
  previous: []
  submit: [file: File | null, newBadges: Array<Badge>]
}>()

const config = useRuntimeConfig()
const { t } = useTranslation()
const { $api } = useNuxtApp()

const { data: badgesLabels } = await useAPI<Record<string, string>>('/api/1/organizations/badges/')
const badges = computed(() => Object.keys(badgesLabels.value ?? {}).map(key => ({ kind: key })))
const defaultValue = { data: [], total: 0 }
const organizationsWithSameSiret = asyncComputed(async () => {
  if (!form.value.business_number_id || !getFirstWarning('business_number_id')) {
    return defaultValue
  }
  return await $api<PaginatedArray<Organization>>(`/api/1/organizations/?business_number_id=${cleanSiret(form.value.business_number_id)}`)
}, defaultValue, { lazy: true })

const newBadges = ref('badges' in organization.value ? organization.value.badges : [])

const file = ref<File | null>(null)
const imagePreview = computed(() => file.value ? URL.createObjectURL(file.value) : undefined)

const checkOrga = ref({
  name: '',
  siren: '',
  type: 'other' as OrganizationTypes,
  exists: null as boolean | null,
})

function checkBusinessId<T, K extends KeysOfUnion<T>, V extends (string | null) & T[K]>(): ValidationFunction<T, K, V> {
  return (value: V, key: K, form: T, t) => {
    const clean = cleanSiret(value)
    if (!clean) return null

    if (/^\d{9}$/.test(clean)) return t('Veuillez renseigner un SIRET (14 chiffres) et non pas un SIREN (9 chiffres).')
    if (!/^\d{14}$/.test(clean)) return t('Un numéro SIRET doit contenir 14 chiffres.')

    // Algorithme de Luhn
    let sum = 0
    for (let i = 0; i < 14; i++) {
      let digit = parseInt(clean.charAt(i), 10)
      if (i % 2 === 0) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
    }

    if (sum % 10 === 0) return null
    return t('Ce numéro SIRET est invalide.')
  }
}

const isCreation = computed(() => props.type === 'create')

const { form, formInfo, getFirstError, getFirstWarning, touch, validate } = useForm(organization, {
  business_number_id: [checkBusinessId()],
  description: [required()],
  name: [required(), ruleIf(isCreation, unique(name => `/api/1/organizations/?name=${name}`, t('Une organisation portant ce nom existe déjà. Veuillez choisir un autre nom ou vérifier si votre organisation existe déjà.')))],
  url: [url()],
}, {
  business_number_id: [ruleIf(isCreation, unique(siret => `/api/1/organizations/?business_number_id=${cleanSiret(siret)}`))],
  description: [minLength(config.public.qualityDescriptionLength)],
  name: [testNotAllowed(config.public.demoServer?.name)],
})

async function submit() {
  if (await validate()) {
    emit('submit', file.value, newBadges.value)
  }
}

function addFiles(newFile: Array<File>) {
  file.value = newFile[0]
}

type SearchAdditionalData = {
  collectivite_territoriale: { code: number } | null
  est_service_public: boolean
  est_association: boolean
}

function getOrganizationType(complements: SearchAdditionalData): OrganizationTypes {
  if (complements.collectivite_territoriale) {
    return LOCAL_AUTHORITY
  }
  if (complements.est_service_public) {
    return PUBLIC_SERVICE
  }
  if (complements.est_association) {
    return ASSOCIATION
  }
  return COMPANY
}

watchEffect(async () => {
  const siret = form.value.business_number_id?.replace(/\s/g, '')
  if (config.public.searchSirenUrl && siret?.length === 14) {
    const { data } = await useFetch<{
      total_results: number
      results: Array<{
        nom_complet: string
        siren: string
        complements: SearchAdditionalData
      }>
    }>(config.public.searchSirenUrl, {
      params: {
        q: siret,
        mtm_campaign: 'datagouv/cdata',
      },
    })

    if (!data.value || data.value.total_results === 0) {
      checkOrga.value.exists = false
      checkOrga.value.type = 'other'
    }
    else {
      checkOrga.value.name = data.value.results[0].nom_complet
      checkOrga.value.siren = data.value.results[0].siren
      checkOrga.value.type = getOrganizationType(data.value.results[0].complements)
      checkOrga.value.exists = true
    }
  }
  else {
    checkOrga.value.exists = null
  }
})
</script>
