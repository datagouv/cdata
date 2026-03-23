<template>
  <FormWithAccordions
    :form-info
    @submit.prevent="submit"
  >
    <SimpleBanner
      v-if="type === 'create'"
      type="primary"
      class="mb-4 flex items-center space-x-5"
    >
      <NuxtImg
        src="/illustrations/harvester.svg"
        loading="lazy"
        class="size-14 shrink-0"
        alt=""
      />
      <div class="w-full">
        <p class="font-bold mb-1">
          {{ $t('Qu’est-ce que le moissonnage ?') }}
        </p>
        <p class="m-0 text-xs/5">
          {{ $t('Le moissonnage est un mécanisme permettant de collecter les métadonnées sur un catalogue distant et de les stocker sur une autre plateforme afin de proposer un second point d’accès aux données.') }}
        </p>
      </div>
    </SimpleBanner>

    <RequiredExplanation />

    <FormFieldset
      v-if="type === 'create'"
      :legend="$t('Producteur')"
    >
      <FieldsetElement form-key="owned">
        <ProducerSelect
          v-model="form.owned"
          :label="t(`Sélectionnez votre organisation`)"
          :required="true"
          :organizations-only="true"
          :organization-permission-need="'harvest'"
          :error-text="getFirstError('owned')"
          :warning-text="getFirstWarning('owned')"
        />
        <template #accordion>
          <HelpAccordion :title="$t(`Choisir l'organisation pour laquelle vous souhaitez mettre en place un moissonneur`)">
            <p class="m-0 mb-4">
              {{ $t("La création d'un moissonneur doit obligatoirement se faire au nom d'une organisation et nécessite les droits administrateurs. Sélectionnez une organisation dont vous êtes administrateur.") }}
            </p>
            <p class="m-0">
              {{ $t("Si votre organisation n'existe pas encore, vous devez d'abord") }}
              <NuxtLink
                to="/admin/organizations/new/"
                class="link"
                target="_blank"
              >
                {{ $t("la créer ici") }}
              </NuxtLink>.
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>
    </FormFieldset>

    <FormFieldset :legend="$t('Description')">
      <FieldsetElement form-key="name">
        <InputGroup
          v-model="form.name"
          class="mb-3"
          :label="$t('Nom')"
          :required="true"
        />

        <template #accordion>
          <HelpAccordion :title="$t('Choisir un nom')">
            <p class="fr-m-0">
              {{ $t("Donnez un nom à votre moissonneur. Il s’agit d’une référence interne, qui vous permet de vous y retrouver si vous créez plusieurs moissonneurs. Le nom de votre moissonneur ne sera pas public.") }} <br>
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>
      <FieldsetElement form-key="description">
        <InputGroup
          v-model="form.description"
          type="markdown"
          :label="$t('Description')"
        />

        <template #accordion>
          <HelpAccordion :title="$t('Décrire votre moissonneur')">
            <p class="fr-m-0">
              {{ $t("Ajoutez des précisions dans le champ description pour votre usage interne. La description est facultative.") }}
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>
      <FieldsetElement form-key="url">
        <InputGroup
          v-model="form.url"
          type="url"
          :label="$t('URL')"
          :required="true"
        />

        <template #accordion>
          <HelpAccordion :title="$t('Sélectionner la bonne URL')">
            <p class="fr-m-0">
              {{ $t("Saisissez ici l’URL du portail à moissonner. Il s’agit généralement de l’URL de la page d’accueil de votre portail d’open data. L’URL permet au moissonneur de parcourir et récupérer tous vos jeux de données.") }}
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>
    </FormFieldset>
    <FormFieldset :legend="$t('Implémentation')">
      <FieldsetElement form-key="backend">
        <SelectGroup
          v-model="form.backend"
          :label="t('Type')"
          :options="backendOptions"
          required
        />
        <template #accordion>
          <HelpAccordion :title="$t(`Sélectionner le type d'implémentation`)">
            <p class="fr-m-0">
              {{ $t("Choisissez le format des métadonnées (ex: DCAT, CKAN, etc.). Ce format permet au moissonneur de savoir comment lire et interpréter vos métadonnées, pour bien les retranscrire sur data.gouv.fr.") }}
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>

      <FieldsetElement
        v-if="backendInfo && backendInfo.filters.length"
        form-key="filters"
      >
        <label class="fr-label">
          {{ $t('Filtres') }}
        </label>

        <div class="space-y-2">
          <div
            v-for="(filter, index) in form.filters"
            :key="index"
            class="flex items-center space-x-2.5"
          >
            <SelectGroup
              v-model="form.filters[index].type"
              class="!mb-0"
              :label="$t('Type de filtre')"
              hide-label
              :options="[{ value: 'include', label: $t('Inclure') }, { value: 'exclude', label: $t('Exclure') }]"
            />
            <SelectGroup
              v-model="form.filters[index].key"
              class="!mb-0"
              :label="$t('Clé du filtre')"
              hide-label
              :options="backendInfo.filters.map((filter) => ({ value: filter.key, label: filter.label }))"
            />
            <InputGroup
              v-model="form.filters[index].value"
              class="!mb-0 w-full"
              :label="$t('Valeur du filtre')"
              hide-label
            />
            <BrandedButton
              :icon="RiDeleteBinLine"
              size="xs"
              color="secondary"
              @click="form.filters.splice(index, 1)"
            >
              {{ $t('Supprimer') }}
            </BrandedButton>
          </div>
          <button
            class="flex items-center space-x-1 text-datagouv-dark"
            type="button"
            @click="form.filters.push({ type: 'include', key: backendInfo.filters[0].key, value: '' })"
          >
            <RiAddLine class="size-4" />
            <span>{{ $t('Ajouter un filtre') }}</span>
          </button>
        </div>
        <template #accordion>
          <HelpAccordion :title="$t('Ajouter des filtres')">
            <p class="fr-m-0">
              {{ $t("Le filtrage donne la possibilité d’inclure ou d’exclure un sous-ensemble de jeux de données du moissonnage. Seuls les jeux de données remplissant toutes les conditions seront traités.") }}
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>

      <FieldsetElement
        v-if="backendInfo && backendInfo.features.length"
        form-key="features"
      >
        <div class="space-y-2">
          <div
            v-for="feature in backendInfo.features"
            :key="feature.key"
          >
            <ToggleSwitch
              v-model="form.features[feature.key]"
              :label="feature.label || feature.key"
            />
          </div>
        </div>
      </FieldsetElement>

      <FieldsetElement
        v-if="backendInfo && backendInfo.extra_configs.length"
        form-key="configs"
      >
        <div class="space-y-2">
          <div
            v-for="(configItem, index) in form.configs"
            :key="index"
          >
            <label
              for=""
              class="fr-label whitespace-nowrap"
            >
              {{ getConfigLabel(configItem.key) }}
            </label>
            <div class="flex items-center space-x-2.5">
              <InputGroup
                v-model="form.configs[index].value"
                class="!mb-0 w-full"
                :label="$t('Type de configuration')"
                hide-label
              />
              <BrandedButton
                :icon="RiDeleteBinLine"
                size="xs"
                color="secondary"
                @click="form.configs.splice(index, 1)"
              >
                {{ $t('Supprimer') }}
              </BrandedButton>
            </div>
          </div>

          <div class="flex items-center space-x-10">
            <button
              v-for="missingConfig in getMissingConfigs()"
              :key="missingConfig.key"
              class="flex items-center space-x-1 text-datagouv-dark"
              @click="form.configs.push({ key: missingConfig.key, value: '' })"
            >
              <RiAddLine class="size-4" />
              <span>{{ $t('Configurer {label}', { label: missingConfig.label }) }}</span>
            </button>
          </div>
        </div>
        <template #accordion>
          <HelpAccordion :title="$t('Ajouter des variables de configuration')">
            <p class="fr-m-0">
              {{ $t("Ajouter une variable de configuration additionnelle de votre moissonneur. Il s’agit d’une configuration optionnelle.") }}
            </p>
          </HelpAccordion>
        </template>
      </FieldsetElement>
      <div class="w-full flex flex-col sm:flex-row">
        <FieldsetElement
          form-key="active"
          class="w-full"
        >
          <ToggleSwitch
            v-model="form.active"
            :label="t('Activé')"
          />
        </FieldsetElement>
        <FieldsetElement
          form-key="autoarchive"
          class="w-full"
        >
          <ToggleSwitch
            v-model="form.autoarchive"
            :label="t('Archivage automatique')"
          />
        </FieldsetElement>
      </div>
    </FormFieldset>
    <FormFieldset
      v-if="isMeAdmin() && type != 'create'"
      :legend="$t('Avancé')"
    >
      <FieldsetElement form-key="schedule">
        <InputGroup
          v-model="form.schedule"
          :label="$t('Planning')"
        />
      </FieldsetElement>
    </FormFieldset>

    <div class="fr-grid-row fr-grid-row--right">
      <slot name="button" />
    </div>
    <slot />
  </FormWithAccordions>
</template>

<script setup lang="ts">
import { BrandedButton, SelectGroup, SimpleBanner } from '@datagouv/components-next'
import { RiAddLine, RiDeleteBinLine } from '@remixicon/vue'
import HelpAccordion from '../Form/HelpAccordion.vue'
import FieldsetElement from '../Form/FieldsetElement.vue'
import InputGroup from '../InputGroup/InputGroup.vue'
import ToggleSwitch from '../Form/ToggleSwitch.vue'
import ProducerSelect from '~/components/ProducerSelect.vue'
import type { HarvestBackend, HarvesterForm } from '~/types/harvesters'

const props = defineProps<{
  type: 'create' | 'update'
}>()
const emit = defineEmits<{
  (event: 'submit'): void
}>()

const model = defineModel<HarvesterForm>({ required: true })
const { t } = useTranslation()
const config = useRuntimeConfig()

onMounted(() => {
  if (props.type === 'update') validate()
})

const { data: backends } = await useAPI<Array<HarvestBackend>>('/api/1/harvest/backends', { lazy: true })

const { form, getFirstError, getFirstWarning, formInfo, validate } = useForm(model, {
  name: [required()],
  url: [required()],
  backend: [required()],
}, {
  name: [testNotAllowed(config.public.demoServer?.name)],
  description: [minLength(500)],
})

const backendOptions = computed(() => {
  if (!backends.value) return []
  return backends.value.map(backend => ({
    value: backend.id,
    label: backend.label,
  }))
})

const backendInfo = computed(() => {
  if (!backends.value) return null
  return backends.value.find(backend => backend.id === form.value.backend)
})

function getConfigLabel(key: string): string {
  if (!backendInfo.value) return key
  return backendInfo.value.extra_configs.find(config => config.key === key)?.label || key
}

function getMissingConfigs(): HarvestBackend['extra_configs'] {
  if (!backendInfo.value) return []
  return backendInfo.value.extra_configs.filter((config) => {
    return !form.value.configs.find(existingConfig => existingConfig.key === config.key)
  })
}

watchEffect(() => {
  // On config change:
  // - initialize available features
  form.value.features = (backendInfo.value?.features || []).reduce<Record<string, boolean>>((acc, feat) => (acc[feat.key] = form.value.features[feat.key] || feat.default, acc), {})
  // - remove previous configs or filters not existing anymore (the backend fails if we send some unknown filters or config)
  form.value.configs = form.value.configs.filter(({ key }) => !backendInfo.value || backendInfo.value.extra_configs.find(config => config.key === key))
  form.value.filters = form.value.filters.filter(({ key }) => !backendInfo.value || backendInfo.value.filters.find(filter => filter.key === key))
})

async function submit() {
  if (await validate()) {
    emit('submit')
  }
};
</script>
