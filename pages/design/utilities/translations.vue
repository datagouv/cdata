<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Traductions
      </h1>
      <p class="mt-2 text-gray-600">
        Système d'internationalisation et composants de traduction.
      </p>
    </div>

    <DesignDocSection
      title="useTranslation / $t"
      description="Composable pour accéder aux fonctions de traduction."
      :in-lib="true"
    >
      <template #preview>
        <ComponentPreview>
          <div class="space-y-2">
            <p>
              <span class="text-gray-500">Simple:</span>
              {{ t('Mon texte traduit') }}
            </p>
            <p>
              <span class="text-gray-500">Avec variable:</span>
              {{ t('Bonjour {name}', { name: 'Jean' }) }}
            </p>
            <p>
              <span class="text-gray-500">Pluriel (0):</span>
              {{ t('{n} élément | {n} éléments', { n: 0 }) }}
            </p>
            <p>
              <span class="text-gray-500">Pluriel (1):</span>
              {{ t('{n} élément | {n} éléments', { n: 1 }) }}
            </p>
            <p>
              <span class="text-gray-500">Pluriel (5):</span>
              {{ t('{n} élément | {n} éléments', { n: 5 }) }}
            </p>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="useTranslationCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="TranslationT"
      description="Composant pour insérer des éléments HTML ou des composants dans une traduction."
      :in-lib="true"
    >
      <template #preview>
        <ComponentPreview>
          <div class="space-y-4">
            <TranslationT keypath="Consultez notre {link} pour plus d'informations.">
              <template #link>
                <a
                  href="#"
                  class="text-datagouv underline"
                >documentation</a>
              </template>
            </TranslationT>

            <TranslationT keypath="Ce dataset a été créé par {organization}.">
              <template #organization>
                <strong>Santé Publique France</strong>
              </template>
            </TranslationT>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="translationTCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { TranslationT } from '@datagouv/components-next'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'

const { t } = useTranslation()

const useTranslationCode = `
<script setup>
import { useTranslation } from '@datagouv/components-next'
// ou dans cdata:
// const { t } = useTranslation()

const { t } = useTranslation()

// Traduction simple
t('Mon texte')

// Avec interpolation
t('Bonjour {name}', { name: 'Jean' })

// Pluralisation
t('{n} élément | {n} éléments', { n: count })
<\/script>
`

const translationTCode = `
<template>
  <TranslationT keypath="Consultez notre {link} pour plus d'infos.">
    <template #link>
      <a href="/docs" class="underline">documentation</a>
    </template>
  </TranslationT>
</template>

<script setup>
import { TranslationT } from '@datagouv/components-next'
<\/script>
`
</script>
