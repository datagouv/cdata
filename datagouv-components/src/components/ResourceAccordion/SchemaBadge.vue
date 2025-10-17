<template>
  <span
    v-if="title"
    class="inline-flex mb-0 items-baseline text-xs"
  >
    <Toggletip
      :button-props="{ class: 'relative z-2 -ml-3 top-1 -my-3', title: t('Schéma de données') }"
      no-margin
    >
      <RiInformationLine class="size-4" />
      <template #toggletip="{ close }">
        <div class="flex justify-between border-bottom">
          <h5 class="fr-text--sm fr-my-0 fr-p-2v">{{ t("Schéma de données") }}</h5>
          <button
            type="button"
            :title="t('Fermer')"
            class="border-left close-button flex items-center justify-center"
            @click="close"
          >&times;</button>
        </div>
        <div class="p-3">
          <div v-if="validataStatus === 'ok'">
            {{ t("Ce fichier est valide pour le schéma :") }} <component
              :is="documentationUrl ? 'a' : 'span'"
              :href="documentationUrl"
              class="fr-link fr-text--sm"
            >{{ title }}</component>.
          </div>
          <div v-if="validataStatus === 'warnings'">
            {{ t("Ce fichier est valide pour le schéma :") }} <component
              :is="documentationUrl ? 'a' : 'span'"
              :href="documentationUrl"
              class="fr-link fr-text--sm"
            >{{ title }}</component>. {{ t("Mais sa conformité peut être améliorée.") }}
          </div>
          <div v-if="validataStatus === 'ko'">
            {{ t("Ce fichier indique suivre le schéma :") }} <component
              :is="documentationUrl ? 'a' : 'span'"
              :href="documentationUrl"
              class="fr-link fr-text--sm"
            >{{ title }}</component>. {{ t("Mais n'est pas conforme.") }}
          </div>

          <div
            v-if="validataWarnings.length"
            class="text-default-warning flex items-center mt-4"
          >
            <span class="fr-icon-alert-line fr-icon--sm mr-1" />
            <span>{{ validataWarnings.length }} {{ t('recommandations') }}</span>
          </div>
          <div
            v-if="validataStructureErrors.length"
            class="text-default-warning flex items-center mt-4"
          >
            <span class="fr-icon-alert-line fr-icon--sm mr-1" />
            <span>{{ validataStructureErrors.length }} {{ t('erreurs de structures') }}</span>
          </div>
          <div
            v-if="validataBodyErrors.length"
            class="text-default-warning flex items-center mt-4"
          >
            <span class="fr-icon-alert-line fr-icon--sm mr-1" />
            <span>{{ validataBodyErrors.length }} {{ t('erreurs de contenus') }}</span>
          </div>

          <div
            v-if="validationUrl"
            class="w-full text-right mt-5"
            target="_blank"
          >
            <a :href="validationUrl">{{ t('Voir le rapport de validation') }}</a>
          </div>
        </div>
      </template>
    </Toggletip>
    <span class="mr-1 text-gray-medium">{{ t("Schéma:") }}</span>
    <span class="flex items-center bg-danger-lightest rounded-sm">
      <span class="fr-tag fr-tag--sm">{{ title }}</span>
      <span
        v-if="validataStatus === 'warnings'"
        class="flex items-center padding-sm"
      >
        <span class="fr-icon-alert-line fr-icon--sm mr-1" />
        <span>{{ t("Invalide") }}</span>
      </span>
      <span
        v-if="validataStatus === 'ko'"
        class="flex items-center text-warning-dark padding-sm"
      >
        <span class="fr-icon-error-line fr-icon--sm mr-1" />
        <span>{{ t("Invalide") }}</span>
      </span>
    </span>
  </span>
</template>

<script setup lang="ts">
import { RiInformationLine } from '@remixicon/vue'
import { computed, onMounted, ref } from 'vue'
import type { Resource } from '../../types/resources'
import Toggletip from '../Toggletip.vue'
import type { RegisteredSchema, ValidataError } from '../../functions/schemas'
import { findSchemaInCatalog, useGetCatalog, useGetSchemaDocumentation, useGetSchemaValidationUrl } from '../../functions/schemas'
import { useTranslation } from '../../composables/useTranslation'

const props = defineProps<{
  resource: Resource
}>()

const { t } = useTranslation()
const getSchemaValidationUrl = useGetSchemaValidationUrl()
const getSchemaDocumentation = useGetSchemaDocumentation()
const getCatalog = useGetCatalog()

const catalog = ref<Array<RegisteredSchema> | null>(null)
onMounted(async () => {
  catalog.value = await getCatalog()
})
const catalogSchema = computed(() => catalog.value ? findSchemaInCatalog(catalog.value, props.resource.schema) : null)
const validationUrl = computed(() => catalogSchema.value ? getSchemaValidationUrl(props.resource, catalogSchema.value) : null)
const documentationUrl = computed(() => catalogSchema.value ? getSchemaDocumentation(catalogSchema.value.name) : null)

const title = computed(() => {
  if (!props.resource.schema) return null
  return props.resource.schema.name || props.resource.schema.url
})

const validataErrors = computed<Array<ValidataError>>(() => props.resource.extras['validation-report:errors'] as Array<ValidataError> || [])
const validataWarnings = computed(() => validataErrors.value.filter(error => [''].includes(error.code)))
const validataBodyErrors = computed(() => validataErrors.value.filter(error => ['#body', '#cell', '#content', '#row', '#table'].some(tag => error.tags.includes(tag))))
const validataStructureErrors = computed(() => validataErrors.value.filter(error => ['#head', '#structure', '#header'].some(tag => error.tags.includes(tag))))

const validataStatus = computed<'ok' | 'warnings' | 'ko'>(() => {
  if (validataErrors.value.length === 0) return 'ok'
  if (validataErrors.value.length === validataWarnings.value.length) return 'warnings'
  return 'ko'
})
</script>

<style scoped>
.close-button {
    width: 40px;
    font-size: 1.2rem;
    line-height: 0;
}
.rounded-sm {
    border-radius: 0.75rem;
}
.padding-sm {
    padding: .125rem .5rem .125rem .25rem;
}
</style>
