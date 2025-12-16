<template>
  <FormWithAccordions
    :form-info
    :form-id
    :no-margin="inModal"
    @submit.prevent="submit"
  >
    <SimpleBanner
      v-if="type === 'create-community'"
      type="primary"
      class="mb-4 flex items-center space-x-5"
    >
      <NuxtImg
        src="/illustrations/truck.svg"
        loading="lazy"
        class="size-14 shrink-0"
        alt=""
      />
      <div class="w-full">
        <p class="font-bold mb-1">
          {{ $t('Qu\'est-ce qu\'une ressource communautaire ?') }}
        </p>
        <p class="m-0 text-xs/5">
          {{ $t('Une ressource communautaire est un contenu ajouté par un utilisateur, un recoupement de données par exemple, pour enrichir ou compléter une ressource communautaire publique.') }}
        </p>
      </div>
    </SimpleBanner>

    <RequiredExplanation />

    <FormFieldset
      v-if="type === 'create-community' && 'owned' in form"
      :legend="$t('Producteur')"
    >
      <FieldsetElement form-key="owned">
        <ProducerSelect
          v-model="form.owned"
          :label="t(`Vérifiez l'identité avec laquelle vous souhaitez publier`)"
          :required="true"
          :error-text="getFirstError('owned')"
          :warning-text="getFirstWarning('owned')"
        />
      </FieldsetElement>
    </FormFieldset>

    <FormFieldset :legend="fileOrLinkLegend">
      <FieldsetElement
        v-if="form.filetype === 'file' || !form.filetype"
        form-key="file"
      >
        <LoadingBlock
          v-slot="{ data: extensions }"
          :status
          :data="extensions"
        >
          <div v-if="extensions">
            <div v-if="newFile">
              <label
                v-if="type === 'update'"
                class="fr-label fr-mb-1w"
              >
                {{ $t('Le fichier actuel sera remplacé par') }}
              </label>
              <FileCard
                v-if="newFile"
                :model-value="{
                  filetype: 'file',
                  title: newFile.name,
                  type: 'main',
                  description: '',
                  schema: null,
                  schema_url: null,
                  checksum_type: null,
                  checksum_value: null,
                  file: {
                    raw: newFile,
                    state: { status: 'waiting' },
                  },
                  resource: null,
                }"
                class="fr-mb-3v"
                :show-edit-and-warning="false"
                :extensions
                @delete="newFile = null; form.filetype = null"
              />
            </div>
            <UploadGroup
              v-else
              :show-label="type === 'update'"
              :label="type === 'update' ? $t('Remplacer le fichier') : $t('Nouveau fichier')"
              type="drop"
              :accept="extensions.join(',')"
              :multiple="false"
              :hint-text="$t('Taille max : 420 Mo.')"
              @change="setFiles"
            />
          </div>
        </LoadingBlock>
      </FieldsetElement>

      <Divider v-if="!form.filetype">
        {{ $t('ou') }}
      </Divider>

      <FieldsetElement
        v-if="form.filetype === 'remote' || !form.filetype"
        form-key="url"
      >
        <InputGroup
          v-model="form.url"
          :label="$t('Lien exact vers le fichier')"
          :required="true"
          :has-error="!!getFirstError('url')"
          :error-text="getFirstError('url')"
          @change="(value) => {
            if (value) {
              form.filetype = 'remote'
              newFile = null
            }
            else {
              form.filetype = null
            }
          }"
        />

        <template #accordion>
          <HelpAccordion :title="$t('Choisir le bon lien')">
            {{ $t("Il est conseillé de mettre le lien vers le fichier lui-même plutôt qu'une page web pour permettre à {site} de l'analyser.") }}
          </HelpAccordion>
        </template>
      </FieldsetElement>
    </FormFieldset>

    <template v-if="form.filetype === 'remote'">
      <BrandedButton
        v-if="! showChecksum"
        color="tertiary"
        :icon="RiAddLine"
        class="-mt-6 mb-6"
        @click="addChecksum = true"
      >
        {{ $t('Ajouter une somme de contrôle') }}
      </BrandedButton>
      <FormFieldset
        v-else
        :legend="$t('Somme de contrôle')"
        class="w-full"
      >
        <template #legendAside>
          <BrandedButton
            color="secondary"
            size="2xs"
            @click="form.checksum_value = null; addChecksum = false"
          >
            {{ $t('Supprimer') }}
          </BrandedButton>
        </template>

        <FieldsetElement form-key="checksum">
          <SelectGroup
            v-model="form.checksum_type"
            :label="$t('Type de somme de contrôle')"
            :has-error="!!getFirstError('checksum_type')"
            :error-text="getFirstError('checksum_type')"
            :options="[
              { value: 'sha1', label: 'SHA1' },
              { value: 'sha2', label: 'SHA2' },
              { value: 'sha256', label: 'SHA256' },
              { value: 'md5', label: 'MD5' },
              { value: 'crc', label: 'CRC' },
            ]"
          />

          <InputGroup
            v-model="form.checksum_value"
            :label="$t('Valeur de la somme de contrôle')"
            :has-error="!!getFirstError('checksum_value')"
            :error-text="getFirstError('checksum_value')"
          />

          <template #accordion>
            <HelpAccordion :title="$t('Somme de contrôle')">
              {{ $t("La somme de contrôle ou checksum permet à l'utilisateur de vérifier que les données téléchargées n'ont pas été corrompues ou altérées.") }}
            </HelpAccordion>
          </template>
        </FieldsetElement>
      </FormFieldset>
    </template>

    <FormFieldset :legend="$t('Description')">
      <FieldsetElement form-key="title">
        <InputGroup
          v-model="form.title"
          class="mb-3"
          :label="$t('Titre')"
          :required="true"
        />

        <template #accordion>
          <HelpAccordion :title="nameAFile">
            <div class="prose prose-neutral fr-m-0">
              <p class="fr-m-0 fr-mb-1w">
                {{ $t("Il est recommandé de choisir un titre qui peut informer tout utilisateur sur le contenu du fichier. Quelques pratiques à éviter :") }}
              </p>
              <ul>
                <li>{{ $t('donner un titre trop générique (ex. : "liste.csv") ;') }}</li>
                <li>{{ $t("donner un titre trop long qui rendrait la manipulation du fichier difficile ;") }}</li>
                <li>{{ $t("donner un titre contenant des accents ou des caractères spéciaux (problèmes d'interopérabilité de fichier) ;") }}</li>
                <li>{{ $t("donner un titre trop technique et dérivé de nomenclatures métier.") }}</li>
              </ul>
            </div>
          </HelpAccordion>
        </template>
      </FieldsetElement>
      <FieldsetElement form-key="type">
        <SelectGroup
          v-model="form.type"
          :label="$t('Type')"
          :required="true"
          :has-error="!!getFirstError('type')"
          :error-text="getFirstError('type') || undefined"
          :options="fileTypes"
        />

        <template #accordion>
          <HelpAccordion :title="$t('Publier les bons types de fichiers')">
            <div class="prose prose-neutral fr-m-0">
              <p class="fr-m-0 fr-mb-1w">
                {{ $t("Vous pouvez choisir parmi les types suivants :") }}
              </p>
              <ul>
                <li
                  v-for="fileType in fileTypes"
                  :key="fileType.value"
                >
                  {{ fileType.label }}
                </li>
              </ul>
            </div>
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
          <HelpAccordion :title="$t('Ajouter de la documentation')">
            <div class="prose prose-neutral fr-m-0">
              <p class="fr-m-0 fr-mb-1w">
                {{ $t("La description d'un fichier facilite la réutilisation des données. Elle comprend, entre autres :") }}
              </p>
              <ul>
                <li>{{ $t("une description générale du jeu de données ;") }}</li>
                <li>{{ $t("une description du mode de production des données ;") }}</li>
                <li>{{ $t("une description du modèle de données ;") }}</li>
                <li>{{ $t("une description du schéma de données ;") }}</li>
                <li>{{ $t("une description des métadonnées ;") }}</li>
                <li>{{ $t("une description des changements majeurs.") }}</li>
              </ul>
            </div>
          </HelpAccordion>
        </template>
      </FieldsetElement>

      <FieldsetElement
        v-if="form.filetype === 'remote'"
        form-key="format"
      >
        <SearchableSelect
          v-model="form.format"
          :label="$t('Format')"
          :placeholder="$t('Rechercher un format…')"
          :display-value="(option) => option"
          :allow-new-option="(query) => query"
          :options="extensions ?? []"
          :multiple="false"
          class="mb-6"
          required

          :error-text="getFirstError('format')"
          :warning-text="getFirstWarning('format')"
        />

        <template #accordion>
          <HelpAccordion :title="$t('Choisir le bon format')">
            <div class="prose prose-neutral fr-m-0">
              <p class="fr-m-0 fr-mb-1w">
                {{ $t("Les formats doivent être :") }}
              </p>
              <ul>
                <li>{{ $t("ouverts : un format ouvert n'ajoute pas de spécifications techniques qui restreignent l'utilisation des données (ex. : utilisation d'un logiciel payant) ;") }}</li>
                <li>{{ $t("facilement réutilisables : un format facilement réutilisable implique que n'importe qui ou serveur peut réutiliser facilement le jeu de données ;") }}</li>
                <li>{{ $t("utilisables dans un système de traitement automatisé : un système de traitement automatisé permet de faire des opérations automatiques, liées à l'exploitation des données (ex. : un fichier CSV est facilement utilisable par un système automatisé contrairement à un fichier PDF).") }}</li>
              </ul>
            </div>
          </HelpAccordion>
        </template>
      </FieldsetElement>
      <FieldsetElement
        v-if="form.filetype === 'remote'"
        form-key="mime"
      >
        <SearchableSelect
          v-model="form.mime"
          :label="$t('Type mime')"
          :placeholder="$t('Rechercher un type mime…')"
          :display-value="(option) => option.text"
          :get-option-id="(option) => option.text"
          :allow-new-option="(query) => ({ text: query })"
          :suggest="suggestMime"
          :multiple="false"

          :error-text="getFirstError('mime')"
          :warning-text="getFirstWarning('mime')"
        />

        <template #accordion>
          <HelpAccordion :title="$t('Choisir un type MIME')">
            <div class="prose prose-neutral fr-m-0">
              <p class="fr-m-0 fr-mb-1w">
                {{ $t("Indiquez le type MIME correspondant au format de la ressource distante (ex. : application/pdf, text/csv). Utilisez un outil en ligne pour le détecter si besoin.") }}
              </p>
            </div>
          </HelpAccordion>
        </template>
      </FieldsetElement>
    </FormFieldset>
    <FormFieldset :legend="$t('Schéma de données')">
      <FieldsetElement
        form-key="schema"
        class="space-y-2"
      >
        <LoadingBlock
          :status="schemaStatus"
          :data="schemasData"
        >
          <template #default="{ data: schemas }">
            <SearchableSelect
              v-model="form.schema"
              :label="$t('Schéma')"
              :placeholder="$t('Rechercher un schéma référencé sur {site}…', { site: config.public.schemasSite.name })"
              :display-value="(option) => option.name"
              :get-option-id="(option) => option.name"
              :options="schemas ?? []"
              :multiple="false"

              :error-text="getFirstError('schema')"
              :warning-text="getFirstWarning('schema')"
            />
            <Divider v-if="!form.schema">
              {{ $t('ou') }}
            </Divider>
            <InputGroup
              v-if="!form.schema"
              v-model="form.schema_url"
              :label="t('Ajouter un lien vers le schéma')"
              :placeholder="'https://...'"
              :error-text="getFirstError('schema_url')"
              :warning-text="getFirstWarning('schema_url')"
              class="w-full !mb-0"
            />
          </template>
          <template #accordion>
            <HelpAccordion :title="$t('Sélectionner un schéma')">
              <TranslationT
                keypath="Il est possible d'identifier un schéma de données existant en visitant le site web {schema}, qui référence une liste de schémas de données existants."
                tag="p"
                class="fr-m-0 fr-mb-1w"
              >
                <template #schema>
                  <a :href="config.public.schemasSite.url">{{ config.public.schemasSite.name }}</a>
                </template>
              </TranslationT>
            </HelpAccordion>
          </template>
        </LoadingBlock>
      </FieldsetElement>
    </FormFieldset>

    <DatasetsSelect
      v-if="type === 'create-community' && 'dataset' in form"
      v-model="datasets"
      :label="$t('Associer un jeu de données')"
      class="w-full"
      single
    />

    <slot />
  </FormWithAccordions>
</template>

<script setup lang="ts">
import { BrandedButton, getResourceLabel, LoadingBlock, RESOURCE_TYPE, SimpleBanner, TranslationT } from '@datagouv/components-next'
import type { DatasetV2, SchemaResponseData } from '@datagouv/components-next'
import { RiAddLine } from '@remixicon/vue'
import SelectGroup from '../Form/SelectGroup/SelectGroup.vue'
import FieldsetElement from '../Form/FieldsetElement.vue'
import HelpAccordion from '../Form/HelpAccordion.vue'
import type { CommunityResourceForm, ResourceForm } from '~/types/types'

const { t } = useTranslation()
const config = useRuntimeConfig()
const { $api } = useNuxtApp()

const props = withDefaults(defineProps<{
  type: 'create-community' | 'update'
  inModal?: boolean
  formId?: string
}>(), {
  inModal: false,
})
const emit = defineEmits<{
  (e: 'submit'): void
}>()

const resourceForm = defineModel<ResourceForm | CommunityResourceForm>({ required: true })
const { form, getFirstError, getFirstWarning, validate, formInfo } = useResourceForm(resourceForm)

const datasets = ref<Array<DatasetV2>>([])
const newFile = ref<File | null>(null)

const route = useRoute()
onMounted(async () => {
  if (props.type !== 'create-community' || !('dataset' in form.value)) return
  if (!route.query.dataset_id) return

  const dataset = await $api<DatasetV2>(`/api/2/datasets/${route.query.dataset_id}/`)
  if (!datasets.value.some(d => d.id === dataset.id)) {
    datasets.value.push(dataset)
  }
})

const isRemote = computed(() => resourceForm.value.filetype === 'remote')
const nameAFile = computed(() => isRemote.value ? t('Nommer un lien') : t('Nommer un fichier'))
const fileOrLinkLegend = computed(() => {
  if (props.type === 'create-community') return t('Fichier ou lien')

  return isRemote.value ? t('Lien') : t('Fichier')
})
const fileTypes = RESOURCE_TYPE.map(type => ({ label: getResourceLabel(type), value: type }))

const setFiles = (files: Array<File>) => {
  form.value.filetype = 'file'
  newFile.value = files[0]
  if ('url' in form.value) {
    delete form.value.url
  }
}

const { data: extensions, status } = await useAPI<Array<string>>('/api/1/datasets/extensions/', { lazy: true })
const { data: schemasData, status: schemaStatus } = await useAPI<SchemaResponseData>('/api/1/datasets/schemas/', { lazy: true })

const { toast } = useToast()

watch(newFile, (file) => {
  // console.log('[DescribeResource] newFile changed:', file ? file.name : 'null')
  if (file && form.value.filetype === 'file') {
    form.value.file = {
      raw: file,
      state: { status: 'waiting' },
    }
  }
})

const submit = async () => {
  if (await validate()) {
    if (newFile.value) {
      if (form.value.filetype !== 'file') throw new Error('Cannot update file of not local file')

      form.value.file = {
        raw: newFile.value,
        state: { status: 'waiting' },
      }
    }

    if (props.type === 'create-community' && !datasets.value.length) {
      toast.error(t('Veuillez associer un jeu de données'))
      return
    }

    if ('dataset' in form.value) {
      form.value.dataset = datasets.value[0]
    }

    emit('submit')
  }
}

const suggestMime = async (query: string) => {
  return await $api<Array<{ text: string }>>('/api/1/datasets/suggest/mime/', {
    query: {
      q: query,
      size: 5,
    },
  })
}

const addChecksum = ref(false)
const showChecksum = computed(() => {
  return addChecksum.value || form.value.checksum_value
})
</script>
