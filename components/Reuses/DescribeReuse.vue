<template>
  <div class="fr-grid-row">
    <Sidemenu
      class="fr-col-12 fr-col-md-5"
      :button-text="$t('Aide')"
      :on-right="true"
      :fixed="true"
    >
      <template #title>
        <span
          class="fr-icon--sm fr-icon-question-line"
          aria-hidden="true"
        />
        {{ $t('Aide') }}
      </template>
      <AccordionGroup :with-icon="true">
        <Accordion
          :id="nameReuseAccordionId"
          :title="t('Nommer votre réutilisation')"
          :state="accordionState('title')"
        >
          <p class="fr-m-0">
            {{ t('Préférez un titre qui permet de comprendre l’usage qui est fait des données plutôt que le nom du site ou de l’application (« Moteur de recherche des accords d’entreprises » plutôt que « Accords-entreprise.fr » par exemple).') }}
          </p>
        </Accordion>
        <Accordion
          :id="addLinkAccordionId"
          :title="t('Quel lien renseigner')"
          :state="accordionState('url')"
        >
          <p class="fr-m-0">
            {{ t("Saisissez le lien de la page sur laquelle la réutilisation est visible. Pointer plutôt vers la réutilisation en elle-même que sur une page d'accueil. Assurez-vous que le lien soit stable dans le temps.") }}
          </p>
        </Accordion>
        <Accordion
          :id="addTypeAccordionId"
          :title="t('Choisissez un type')"
          :state="accordionState('type')"
        >
          <div class="prose prose-neutral fr-m-0">
            <p class="fr-m-0">
              {{ t('Indiquez le type dans lequel ranger la réutilisation (API, application, article de presse, visualisation, etc.).') }}
            </p>
          </div>
        </Accordion>
        <Accordion
          :id="addTopicAccordionId"
          :title="t('Choisir une thématique')"
          :state="accordionState('topic')"
        >
          <p class="fr-m-0">
            {{ t("Choisissez la thématique associée à votre réutilisation.") }}
          </p>
        </Accordion>
        <Accordion
          :id="addDescriptionAccordionId"
          :title="t('Décrivez votre réutilisation')"
          :state="accordionState('description')"
        >
          <p class="fr-m-0">
            {{ t("Vous pouvez renseigner notamment la méthode de création de la réutilisation, ce que la réutilisation permet de faire ou de montrer ou encore en dire plus sur vous et sur le contexte de cette réutilisation.\nIl est préférable de garder un ton neutre : si la réutilisation ressemble trop à un message promotionnel il est possible que nous la supprimions.") }}
          </p>
        </Accordion>
        <Accordion
          :id="addTagsAccordionId"
          :title="t('Ajouter des mots-clés')"
          :state="accordionState('tags')"
        >
          <div class="prose prose-neutral m-0">
            <p class="m-0">
              {{ t("Les mots clés apparaissent sur la page de présentation et apportent un meilleur référencement lors d'une recherche utilisateur.\nÀ partir de chaque mot clé, vous pouvez obtenir la liste des réutilisations pour lesquelles le mot clé a également été assigné.") }}
            </p>
            <p class="fr-mt-3v font-bold">
              {{ t("Suggestions automatiques") }}
            </p>
            <p class="m-0">
              {{ t("Des mots-clés peuvent vous être proposés automatiquement en fonction du contenu de votre réutilisation. Vous pouvez les accepter, les modifier ou les supprimer.") }}
            </p>
            <p class="m-0">
              <CdataLink
                to="https://guides.data.gouv.fr/autres-ressources-utiles/notre-approche-de-lintelligence-artificielle-sur-data.gouv.fr"
                target="_blank"
              >
                {{ t(`L'IA se base uniquement sur les informations que vous avez fournies et peut parfois se tromper : relisez toujours la proposition avant de valider.`) }}
              </CdataLink>
            </p>
          </div>
        </Accordion>
        <Accordion
          :id="addImageAccordionId"
          :title="t('Choisir une image')"
          :state="accordionState('image')"
        >
          <p class="fr-m-0">
            {{ t(`Si votre réutilisation prend la forme d’une représentation graphique, vous pouvez en donner un aperçu aux autres utilisateurs au moyen d’une image ou d’une capture d’écran. Cette image figurera dans la partie Réutilisations de la page du jeu de données associé.\nLorsque c’est pertinent, les captures d’écrans permettent de mieux rendre compte de ce qu’est la réutilisation, elles sont donc préférables aux logos ou aux illustrations par exemple.`) }}
          </p>
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
              {{ t(`Qu'est-ce qu'une réutilisation ?`) }}
            </p>
            <p class="m-0 text-xs/5">
              {{ t("Une réutilisation est un exemple d'utilisation de données publiques.") }} {{ t('Publier une réutilisation peut vous permettre de gagner en visibilité et de démarrer un dialogue avec le producteur du jeu de données.') }}
            </p>
          </div>
        </SimpleBanner>

        <slot name="top" />

        <RequiredExplanation />
        <fieldset
          v-if="isMeAdmin() && type === 'update'"
          class="fr-fieldset"
        >
          <legend
            id="featured-legend"
            class="fr-fieldset__legend"
          >
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t("Mis en avant") }}
            </h2>
          </legend>
          <ToggleSwitch
            v-model="form.featured"
            :label="$t('Mettre en avant')"
            @update:model-value="$emit('feature')"
          />
        </fieldset>
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
              {{ $t("Producteur") }}
            </h2>
          </legend>
          <div class="fr-fieldset__element">
            <ProducerSelect
              v-model="form.owned"
              :label="t(`Vérifiez l'identité avec laquelle vous souhaitez publier`)"
              :options="ownedOptions"
              :required="true"
              :error-text="getFirstError('owned')"
              :warning-text="getFirstWarning('owned')"
              :all="isMeAdmin()"
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
              class="mb-3"
              :aria-describedby="nameReuseAccordionId"
              :label="t('Nom de la réutilisation')"
              :required="true"
              :has-error="!!getFirstError('title')"
              :has-warning="!!getFirstWarning('title')"
              :error-text="getFirstError('title')"
            />
            <SimpleBanner
              v-if="getFirstWarning('title')"
              type="warning"
            >
              {{ getFirstWarning("title") }}
            </SimpleBanner>
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addLinkAccordionId"
            @blur="touch('url')"
          >
            <InputGroup
              v-model="reuseForm.url"
              :aria-describedby="addLinkAccordionId"
              :label="t('Lien')"
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
              class="mb-3"
              :label="$t('Type')"
              :placeholder="$t('Rechercher un type…')"
              :get-option-id="(type: { label: string }) => type.label"
              :display-value="(type: { label: string }) => type.label"
              :options="types ?? []"
              :multiple="false"
              :required="true"
              :error-text="getFirstError('type')"
              :warning-text="getFirstWarning('type')"
            />
            <SimpleBanner
              v-if="getFirstWarning('type')"
              type="warning"
            >
              {{ getFirstWarning("type") }}
            </SimpleBanner>
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addTopicAccordionId"
            @blur="touch('topic')"
          >
            <SearchableSelect
              v-model="reuseForm.topic"
              class="mb-3"
              :label="$t('Thématique')"
              :placeholder="$t('Rechercher une thématique…')"
              :get-option-id="(topic: { label: string }) => topic.label"
              :display-value="(topic: { label: string }) => topic.label"
              :options="topics ?? []"
              :multiple="false"
              :required="true"
              :error-text="getFirstError('topic')"
              :warning-text="getFirstWarning('topic')"
            />
            <SimpleBanner
              v-if="getFirstWarning('topic')"
              type="warning"
            >
              {{ getFirstWarning("topic") }}
            </SimpleBanner>
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addDescriptionAccordionId"
          >
            <InputGroup
              v-model="reuseForm.description"
              class="mb-3"
              :label="t('Description')"
              :required="true"
              type="markdown"
              :has-error="!!getFirstError('description')"
              :has-warning="!!getFirstWarning('description')"
              :error-text="getFirstError('description')"
              @change="touch('description')"
            />
            <SimpleBanner
              v-if="getFirstWarning('description')"
              type="warning"
            >
              {{ getFirstWarning("description") }}
            </SimpleBanner>
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addTagsAccordionId"
            @blur="touch('tags')"
          >
            <TagsSelect
              v-model="form.tags"
              class="mb-3"
              :error-text="getFirstError('tags')"
              :warning-text="getFirstWarning('tags')"
            />
            <div class="flex items-center gap-4 mt-2 mb-3">
              <Tooltip v-if="!canGenerateTags && form.tags.length >= MAX_TAGS_NB">
                <BrandedButton
                  type="button"
                  color="primary"
                  :icon="RiSparklingLine"
                  :loading="isGeneratingTags"
                  :disabled="true"
                >
                  {{ $t('Suggérer des mots clés') }}
                </BrandedButton>
                <template #tooltip>
                  {{ $t('Vous avez déjà {count} mots-clés. Le maximum recommandé est de {max}.', { count: form.tags.length, max: MAX_TAGS_NB }) }}
                </template>
              </Tooltip>
              <BrandedButton
                v-else
                type="button"
                color="primary"
                :icon="RiSparklingLine"
                :loading="isGeneratingTags"
                :disabled="!canGenerateTags"
                @click="handleAutoCompleteTags(MAX_TAGS_NB)"
              >
                <template v-if="isGeneratingTags">
                  {{ $t('Suggestion en cours...') }}
                </template>
                <template v-else>
                  {{ $t('Suggérer des mots clés') }}
                </template>
              </BrandedButton>
              <CdataLink
                v-if="config.public.generateTagsFeedbackUrl"
                :to="config.public.generateTagsFeedbackUrl"
                target="_blank"
                class="text-sm text-gray-medium"
              >
                {{ $t('Comment avez-vous trouvé cette suggestion ?') }}
              </CdataLink>
            </div>
            <SimpleBanner
              v-if="getFirstWarning('tags')"
              type="warning"
            >
              {{ getFirstWarning("tags") }}
            </SimpleBanner>
          </LinkedToAccordion>
          <LinkedToAccordion
            class="fr-fieldset__element"
            :accordion="addImageAccordionId"
            @blur="touch('image')"
          >
            <UploadGroup
              :label="$t('Image de couverture')"
              type="drop"
              accept=".jpeg, .jpg, .png"
              :hint-text="$t('Taille max : 4 Mo. Formats acceptés : JPG, JPEG, PNG')"
              :has-error="!!getFirstError('image')"
              :has-warning="!!getFirstWarning('image')"
              :error-text="getFirstError('image')"
              :show-label="true"
              :required="true"
              @change="setFiles"
            />
            <div
              v-if="imagePreview"
              class="text-center"
            >
              <NuxtImg
                :src="imagePreview"
                class="border mx-auto max-h-40 aspect-square"
                loading="lazy"
                alt=""
              />
            </div>
            <SimpleBanner
              v-if="getFirstWarning('image')"
              class="mt-2"
              type="warning"
            >
              {{ getFirstWarning("image") }}
            </SimpleBanner>
          </LinkedToAccordion>
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
import { BrandedButton, Tooltip, SimpleBanner, type ReuseTopic, type ReuseType, type Owned } from '@datagouv/components-next'
import { RiSparklingLine } from '@remixicon/vue'
import { computed } from 'vue'
import Accordion from '~/components/Accordion/Accordion.global.vue'
import AccordionGroup from '~/components/Accordion/AccordionGroup.global.vue'
import CdataLink from '~/components/CdataLink.vue'
import ToggleSwitch from '~/components/Form/ToggleSwitch.vue'
import ProducerSelect from '~/components/ProducerSelect.vue'
import RequiredExplanation from '~/components/RequiredExplanation/RequiredExplanation.vue'
import type { ReuseForm, Tag } from '~/types/types'

const reuseForm = defineModel<ReuseForm>({ required: true })
const props = defineProps<{
  type: 'create' | 'update'
}>()

const emit = defineEmits<{
  (event: 'feature' | 'submit'): void
}>()

const { t } = useTranslation()

const user = useMe()
const config = useRuntimeConfig()

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
  return [...user.value.organizations.map(organization => ({ organization, owner: null })), { owner: { ...user.value, class: 'User' }, organization: null }]
})

const MAX_TAGS_NB = 5

// Track tag sources
const isGeneratingTags = ref(false)
const lastSuggestedTags = ref<Array<Tag>>([])

const { form, touch, getFirstError, getFirstWarning, validate } = useForm(reuseForm, {
  featured: [],
  owned: [required()],
  title: [required()],
  description: [required()],
  url: [required(), url()],
  type: [required()],
  topic: [required()],
  image: [required()],
  private: [],
}, {
  title: [testNotAllowed(config.public.demoServer?.name)],
  description: [minLength(200, t(`Il est recommandé d'avoir une {property} d'au moins {min} caractères.`, { property: t('description'), min: 200 }))],
})

onMounted(() => {
  if (props.type === 'update') validate()
})

const accordionState = (key: keyof typeof form.value) => {
  if (getFirstError(key)) return 'error'
  if (getFirstWarning(key)) return 'warning'

  return 'default'
}

const canGenerateTags = computed(() => {
  const hasTitle = form.value.title && form.value.title.trim().length > 0
  const hasDescription = form.value.description && form.value.description.trim().length > 0
  const hasType = form.value.type?.label && form.value.type.label.trim().length > 0
  const hasLessThanMaxTags = form.value.tags.length < MAX_TAGS_NB
  return hasTitle && hasDescription && hasType && hasLessThanMaxTags
})

const setFiles = (files: Array<File>) => {
  reuseForm.value.image = files[0]
}
const imagePreview = computed(() => {
  if (!reuseForm.value.image) return null
  if (typeof reuseForm.value.image === 'string') return reuseForm.value.image
  return URL.createObjectURL(reuseForm.value.image)
})

async function submit() {
  if (await validate()) {
    emit('submit')
  }
}

async function handleAutoCompleteTags(nbTags: number) {
  if (!form.value.type?.label) {
    return
  }

  try {
    isGeneratingTags.value = true

    // We call our server-side API route instead of Albert API directly to avoid CORS issues.
    // The Albert API doesn't allow direct requests from browser-side JavaScript.
    // Our server acts as a proxy, keeping the API key secure on the server side.
    const response = await $fetch<{ tags: string[] }>('/nuxt-api/albert/generate-reuse-tags', {
      method: 'POST',
      body: {
        title: form.value.title,
        description: form.value.description,
        type: form.value.type.label.toLowerCase(),
        nbTags: nbTags,
      },
    })

    // Remove previously suggested tags and add new ones
    if (response.tags && response.tags.length > 0) {
      // Filter out tags that were the last suggested tags
      let currentTags = form.value.tags
      if (lastSuggestedTags.value.length > 0) {
        currentTags = form.value.tags.filter(tag =>
          !lastSuggestedTags.value.some(lastSuggested => lastSuggested.text === tag.text),
        )
      }

      // Create new suggested tags, filtering out duplicates with existing tags
      const existingTagTexts = currentTags.map(tag => tag.text)
      const newSuggestedTags = response.tags
        .filter(tag => !existingTagTexts.includes(tag))
        .map(tag => ({ text: tag }))

      // Update form with current tags + new suggested tags
      form.value.tags = [...currentTags, ...newSuggestedTags]

      // Update the suggested tags tracking
      lastSuggestedTags.value = newSuggestedTags
    }
  }
  catch (error) {
    console.error('Failed to generate tags:', error)
  }
  finally {
    isGeneratingTags.value = false
  }
}
</script>
