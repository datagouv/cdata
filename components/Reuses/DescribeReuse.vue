<template>
  <div class="fr-grid-row">
    <Sidemenu
      class="fr-col-12 fr-col-md-5"
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
      <AccordionGroup>
        <Accordion
          :id="nameReuseAccordionId"
          :title="t('Naming your reuse')"
          :state="accordionState('title')"
        >
          <p class="fr-m-0">
            {{ t('Prefer a title that allows understanding of the use made of the data rather than the name of the website or application ("Search Engine for Company Agreements" rather than "Accords-entreprise.fr" for example).') }}
          </p>
        </Accordion>
        <Accordion
          :id="addLinkAccordionId"
          :title="t('What link to provide')"
          :state="accordionState('url')"
        >
          <p class="fr-m-0">
            {{ t("Enter the link of the page on which the reuse is visible. Point directly to the reuse itself rather than a homepage. Make sure the link is stable over time.") }}
          </p>
        </Accordion>
        <Accordion
          :id="addTypeAccordionId"
          :title="t('Choose a type')"
          :state="accordionState('type')"
        >
          <div class="prose prose-neutral fr-m-0">
            <p class="fr-m-0">
              {{ t('Please indicate the type under which to categorize the reuse (API, application, news article, visualization, etc.).') }}
            </p>
            <SimpleBanner
              v-if="getFirstWarning('type')"
              class="font-bold mt-2"
              type="warning"
            >
              {{ getFirstWarning("type") }}
            </SimpleBanner>
          </div>
        </Accordion>
        <Accordion
          :id="addTopicAccordionId"
          :title="t('Choose a theme')"
          :state="accordionState('topic')"
        >
          <p class="fr-m-0">
            {{ t("Choose the theme associated with your reuse.") }}
          </p>
          <SimpleBanner
            v-if="getFirstWarning('topic')"
            class="font-bold mt-2"
            type="warning"
          >
            {{ getFirstWarning("topic") }}
          </SimpleBanner>
        </Accordion>
        <Accordion
          :id="addDescriptionAccordionId"
          :title="t('Describe your reuse')"
          :state="accordionState('description')"
        >
          <p class="fr-m-0">
            {{ t("You can provide information about the method of creating the reuse, what the reuse allows to do or show, or tell more about yourself and the context of this reuse. It is preferable to maintain a neutral tone: if the reuse resembles too much like a promotional message, we may delete it.") }}
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
          :id="addTagsAccordionId"
          :title="t('Add keywords')"
          :state="accordionState('tags')"
        >
          <p class="fr-m-0">
            {{ t("Keywords appear on the presentation page and improve search engine optimization when a user is searching. From each keyword, you can obtain a list of reuses for which the keyword has also been assigned.") }}
          </p>
          <SimpleBanner
            v-if="getFirstWarning('tags')"
            class="font-bold mt-2"
            type="warning"
          >
            {{ getFirstWarning("tags") }}
          </SimpleBanner>
        </Accordion>
        <Accordion
          :id="addImageAccordionId"
          :title="t('Choose an image')"
          :state="accordionState('image')"
        >
          <p class="fr-m-0">
            {{ t(`If your reuse takes the form of a graphical representation, you can provide a preview to other users through an image or screenshot. This image will appear in the "Reuses" section of the associated dataset page. When relevant, screenshots are more effective in conveying what the reuse is about, so they are preferable to logos or illustrations, for example.`) }}
          </p>
          <SimpleBanner
            v-if="getFirstWarning('image')"
            class="font-bold mt-2"
            type="warning"
          >
            {{ getFirstWarning("image") }}
          </SimpleBanner>
        </Accordion>
      </AccordionGroup>
    </Sidemenu>
    <form
      class="fr-col-12 fr-col-md-7"
      @submit.prevent="submit"
    >
      <div class="fr-p-3w bg-white">
        <SimpleBanner
          v-if="type === 'create'"
          type="primary"
          class="mb-4 flex items-center space-x-5"
        >
          <NuxtImg
            src="/illustrations/reuse.svg"
            loading="lazy"
            class="size-14 shrink-0"
            alt=""
          />
          <div class="w-full">
            <p class="font-bold mb-1">
              {{ t('What is a reuse?') }}
            </p>
            <p class="m-0 text-xs/5">
              {{ t("A reuse is an exemple of public data's usage.") }} {{ t('Publishing a reuse can allow you to gain visibility and start start a dialogue with the dataset producer.') }}
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
              :required="true"
              :error-text="getFirstError('owned')"
              :warning-text="getFirstWarning('owned')"
              @focusout="touch('owned')"
            />
          </div>
        </fieldset>
        <fieldset
          class="fr-fieldset"
          aria-labelledby="description-legend"
        >
          <legend
            id="description-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ t("Description") }}
            </h2>
          </legend>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="nameReuseAccordionId"
            @blur="touch('title')"
          >
            <InputGroup
              v-model="reuseForm.title"
              :aria-describedby="nameReuseAccordionId"
              :label="t('Reuse name')"
              :required="true"
              :has-error="!!getFirstError('title')"
              :has-warning="!!getFirstWarning('title')"
              :error-text="getFirstError('title')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addLinkAccordionId"
            @blur="touch('url')"
          >
            <InputGroup
              v-model="reuseForm.url"
              :aria-describedby="addLinkAccordionId"
              :label="t('Link')"
              type="url"
              placeholder="https://..."
              :required="true"
              :has-error="!!getFirstError('url')"
              :has-warning="!!getFirstWarning('url')"
              :error-text="getFirstError('url')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addTypeAccordionId"
            @blur="touch('type')"
          >
            <SearchableSelect
              v-model="reuseForm.type"
              :label="$t('Type')"
              :placeholder="$t('Search a type…')"
              :get-option-id="(type) => type.label"
              :display-value="(type) => type.label"
              :options="types"
              :multiple="false"
              :required="true"
              :error-text="getFirstError('type')"
              :warning-text="getFirstWarning('type')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addTopicAccordionId"
            @blur="touch('topic')"
          >
            <SearchableSelect
              v-model="reuseForm.topic"
              :label="$t('Theme')"
              :placeholder="$t('Search a theme…')"
              :get-option-id="(topic) => topic.label"
              :display-value="(topic) => topic.label"
              :options="topics"
              :multiple="false"
              :required="true"
              :error-text="getFirstError('topic')"
              :warning-text="getFirstWarning('topic')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addDescriptionAccordionId"
          >
            <InputGroup
              v-model="reuseForm.description"
              :label="t('Description')"
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
            :accordion="addTagsAccordionId"
            @blur="touch('tags')"
          >
            <TagsSelect
              v-model="form.tags"
              :error-text="getFirstError('tags')"
              :warning-text="getFirstWarning('tags')"
            />
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addImageAccordionId"
            @blur="touch('image')"
          >
            <UploadGroup
              :label="$t('Cover picture')"
              type="drop"
              accept=".jpeg, .jpg, .png"
              :hint-text="$t('Max size: 4Mo. Accepted formats: JPG, JPEG, PNG')"
              :has-error="!!getFirstError('image')"
              :has-warning="!!getFirstWarning('image')"
              :error-text="getFirstError('image')"
              :show-label="true"
              :required="true"
              @change="setFiles"
            />
            <div
              v-if="imagePreview"
              class="text-align-center"
            >
              <NuxtImg
                :src="imagePreview"
                class="border mx-auto max-h-40 aspect-square"
                loading="lazy"
                alt=""
              />
            </div>
          </LinkedToAccordion>
          <fieldset
            v-if="type === 'update'"
            class="fr-fieldset__element"
          >
            <fieldset
              id="checkboxes-hint-el-sm"
              class="fr-fieldset"
              aria-labelledby="checkboxes-hint-el-sm-legend checkboxes-hint-el-sm-messages"
            >
              <div class="fr-fieldset__element">
                <div class="fr-checkbox-group fr-checkbox-group--sm">
                  <input
                    id="checkboxes-hint-el-sm-1"
                    v-model="reuseForm.private"
                    name="checkboxes-hint-el-sm-1"
                    type="checkbox"
                    aria-describedby="checkboxes-hint-el-sm-1-messages"
                  >
                  <label
                    class="fr-label"
                    for="checkboxes-hint-el-sm-1"
                  >
                    {{ t('Switch to draft mode') }}
                    <span class="fr-hint-text">{{ t('The reuse will only be visible to members of your organization.') }}</span>
                  </label>
                  <div
                    id="checkboxes-hint-el-sm-1-messages"
                    class="fr-messages-group"
                    aria-live="assertive"
                  />
                </div>
              </div>
            </fieldset>
          </fieldset>
        </fieldset>
        <div class="fr-grid-row fr-grid-row--right">
          <slot name="button" />
        </div>
        <slot />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { SimpleBanner, type ReuseType } from '@datagouv/components-next'
import { computed } from 'vue'
import Accordion from '~/components/Accordion/Accordion.global.vue'
import AccordionGroup from '~/components/Accordion/AccordionGroup.global.vue'
import ProducerSelect from '~/components/ProducerSelect.vue'
import RequiredExplanation from '~/components/RequiredExplanation/RequiredExplanation.vue'
import type { ReuseForm, Owned, ReuseTopic } from '~/types/types'

const reuseForm = defineModel<ReuseForm>({ required: true })
const props = defineProps<{
  type: 'create' | 'update'
}>()

const emit = defineEmits<{
  (event: 'submit'): void
}>()

const { t } = useI18n()

const user = useMe()

const nameReuseAccordionId = useId()
const addLinkAccordionId = useId()
const addTypeAccordionId = useId()
const addTopicAccordionId = useId()
const addDescriptionAccordionId = useId()
const addTagsAccordionId = useId()
const addImageAccordionId = useId()

const { data: types } = await useAPI<Array<ReuseType>>('/api/1/reuses/types', { lazy: true })
const { data: topics } = await useAPI<Array<ReuseTopic>>('/api/1/reuses/topics', { lazy: true })

const ownedOptions = computed<Array<Owned>>(() => {
  return [...user.value.organizations.map(organization => ({ organization, owner: null })), { owner: user.value, organization: null }]
})

const { form, touch, getFirstError, getFirstWarning, validate } = useForm(reuseForm, {
  owned: [required()],
  title: [required()],
  description: [required()],
  url: [required(), url()],
  type: [required()],
  topic: [required()],
  image: [required()],
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

const setFiles = (files: Array<File>) => {
  reuseForm.value.image = files[0]
}
const imagePreview = computed(() => {
  if (!reuseForm.value.image) return null
  if (typeof reuseForm.value.image === 'string') return reuseForm.value.image
  return URL.createObjectURL(reuseForm.value.image)
})

function submit() {
  if (validate()) {
    emit('submit')
  }
};
</script>
