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
          {{ $t('What is a community resource?') }}
        </p>
        <p class="m-0 text-xs/5">
          {{ $t('A community resource is content added by a user, a cross-referencing of data for example, to enrich or complete a public community resource.') }}
        </p>
      </div>
    </SimpleBanner>

    <RequiredExplanation />

    <FormFieldset
      v-if="'owned' in form"
      :legend="$t('Producer')"
    >
      <FieldsetElement form-key="owned">
        <ProducerSelect
          v-model="form.owned"
          :label="t('Check the identity with which you want to publish')"
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
        <div v-if="newFile">
          <label
            v-if="type === 'update'"
            class="fr-label fr-mb-1w"
          >
            {{ $t('The current file will be replaced by') }}
          </label>
          <FileCard
            v-if="newFile"
            :model-value="{
              filetype: 'file',
              title: newFile.name,
              type: 'main',
              description: '',
              schema: null,
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
          :label="type === 'update' ? $t('Replace file') : $t('New file')"
          type="drop"
          :accept="extensions.join(',')"
          :multiple="false"
          :hint-text="$t('Max size: 420 Mb.')"
          @change="setFiles"
        />
      </FieldsetElement>

      <p
        v-if="!form.filetype"
        class="fr-hr-or w-full text-transform-lowercase fr-text--regular"
      >
        <span class="fr-hr-or-text">{{ t('or') }}</span>
      </p>

      <FieldsetElement
        v-if="form.filetype === 'remote' || !form.filetype"
        form-key="url"
      >
        <InputGroup
          v-model="form.url"
          :label="$t('Exact link to the file')"
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
          <HelpAccordion :title="$t('Choose the correct link')">
            {{ $t("It's advised to put the link to the file itself instead of a web page to allow {site} to parse it.") }}
          </HelpAccordion>
        </template>
      </FieldsetElement>
    </FormFieldset>

    <FormFieldset :legend="$t('Description')">
      <FieldsetElement form-key="title">
        <InputGroup
          v-model="form.title"
          :label="$t('Title')"
          :required="true"
        />

        <template #accordion>
          <HelpAccordion :title="nameAFile">
            <div class="prose prose-neutral fr-m-0">
              <p class="fr-m-0 fr-mb-1w">
                {{ $t("It is recommended to choose a title that can inform any user about the content of the file. Some practices to avoid:") }}
              </p>
              <ul>
                <li>{{ $t('giving a too generic title (e.g., "list.csv");') }}</li>
                <li>{{ $t("giving a too long title that would make the file manipulation difficult;") }}</li>
                <li>{{ $t("giving a title containing accents or special characters (file interoperability issues);") }}</li>
                <li>{{ $t("giving a title that is too technical and derived from business nomenclatures.") }}</li>
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
          <HelpAccordion :title="$t('Publish the correct file types')">
            <div class="prose prose-neutral fr-m-0">
              <p class="fr-m-0 fr-mb-1w">
                {{ $t("You can choose from the following types:") }}
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
          <HelpAccordion :title="$t('Add documentation')">
            <div class="prose prose-neutral fr-m-0">
              <p class="fr-m-0 fr-mb-1w">
                {{ $t("The description of a file facilitates the reuse of data. It includes, among others:") }}
              </p>
              <ul>
                <li>{{ $t("a general description of the dataset ;") }}</li>
                <li>{{ $t("a description of the data production mode ;") }}</li>
                <li>{{ $t("a description of the data model ;") }}</li>
                <li>{{ $t("a description of the data schema ;") }}</li>
                <li>{{ $t("a description of the metadata ;") }}</li>
                <li>{{ $t("a description of major changes.") }}</li>
              </ul>
            </div>
          </HelpAccordion>
        </template>
      </FieldsetElement>
      <FieldsetElement form-key="schema">
        <SearchableSelect
          v-model="form.schema"
          :label="$t('Schema')"
          :placeholder="$t('Search a schema…')"
          :display-value="(option) => option.name"
          :get-option-id="(option) => option.name"
          :options="schemas"
          :multiple="false"

          :error-text="getFirstError('schema')"
          :warning-text="getFirstWarning('schema')"
        />

        <template #accordion>
          <HelpAccordion :title="$t('Select a schema')">
            <i18n-t
              keypath="It is possible to identify an existing data schema by visiting the {schema} website, that references a list of existing data schema."
              tag="p"
              class="fr-m-0 fr-mb-1w"
            >
              <template #schema>
                <a :href="config.public.schemasSite.url">{{ config.public.schemasSite.name }}</a>
              </template>
            </i18n-t>
          </HelpAccordion>
        </template>
      </FieldsetElement>
      <FieldsetElement
        v-if="form.filetype === 'remote'"
        form-key="mime"
      >
        <SearchableSelect
          v-model="form.mime"
          :label="$t('Mime type')"
          :placeholder="$t('Search a mime type…')"
          :display-value="(option) => option.text"
          :get-option-id="(option) => option.text"
          :allow-new-option="(query) => ({ text: query })"
          :suggest="suggestMime"
          :multiple="false"

          :error-text="getFirstError('mime')"
          :warning-text="getFirstWarning('mime')"
        />
      </FieldsetElement>
      <FieldsetElement
        v-if="form.filetype === 'remote'"
        form-key="mime"
      >
        <SearchableSelect
          v-model="form.format"
          :label="$t('Format')"
          :placeholder="$t('Search a format…')"
          :display-value="(option) => option"
          :allow-new-option="(query) => query"
          :options="extensions"
          :multiple="false"
          class="mb-6"
          required

          :error-text="getFirstError('format')"
          :warning-text="getFirstWarning('format')"
        />

        <template #accordion>
          <HelpAccordion :title="$t('Choose the right format')">
            <div class="prose prose-neutral fr-m-0">
              <p class="fr-m-0 fr-mb-1w">
                {{ $t("The formats must be:") }}
              </p>
              <ul>
                <li>{{ $t("open : an open format doesn't add technical specifications that restrict data use (i.e. using a paid software) ;") }}</li>
                <li>{{ $t("easily reusable : a format easily reusable implies that anybody or server can reuse easily the dataset ;") }}</li>
                <li>{{ $t("usable in an automated processing system : an automated processing system allows to make automatic operations, related to data exploitation (i.e. a CSV file is easily usable by an automated system unlike a PDF file).") }}</li>
              </ul>
            </div>
          </HelpAccordion>
        </template>
      </FieldsetElement>
    </FormFieldset>

    <DatasetsSelect
      v-if="type === 'create-community' && 'dataset' in form"
      v-model="datasets"
      :label="$t('Associate a dataset')"
      class="w-full"
      single
    />

    <slot />
  </FormWithAccordions>
</template>

<script setup lang="ts">
import { getResourceLabel, RESOURCE_TYPE, SimpleBanner } from '@datagouv/components-next'
import type { SchemaResponseData } from '@datagouv/components-next'
import SelectGroup from '../Form/SelectGroup/SelectGroup.vue'
import FieldsetElement from '../Form/FieldsetElement.vue'
import HelpAccordion from '../Form/HelpAccordion.vue'
import type { CommunityResourceForm, ResourceForm } from '~/types/types'

const { t } = useI18n()
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

const datasets = ref([])
const newFile = ref<File | null>(null)

const isRemote = computed(() => resourceForm.value.filetype === 'remote')
const nameAFile = computed(() => isRemote.value ? t('Name a link') : t('Name a file'))
const fileOrLinkLegend = computed(() => {
  if (props.type === 'create-community') return t('File or link')

  return isRemote.value ? t('Link') : t('File')
})
const fileTypes = RESOURCE_TYPE.map(type => ({ label: getResourceLabel(type), value: type }))

const setFiles = (files: Array<File>) => {
  form.value.filetype = 'file'
  newFile.value = files[0]
  if ('url' in form.value) {
    delete form.value.url
  }
}

const { data: extensions } = await useAPI<Array<string>>('/api/1/datasets/extensions/')
const { data: schemas } = await useAPI<SchemaResponseData>('/api/1/datasets/schemas/')

const { toast } = useToast()

const submit = () => {
  if (validate()) {
    if (newFile.value) {
      if (form.value.filetype !== 'file') throw new Error('Cannot update file of not local file')

      form.value.file = {
        raw: newFile.value,
        state: { status: 'waiting' },
      }
    }

    if (props.type === 'create-community' && !datasets.value.length) {
      toast.error(t('Please associate a dataset'))
      return
    }

    console.log(form.value)

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
</script>
