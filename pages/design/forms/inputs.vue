<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Inputs
      </h1>
      <p class="mt-2 text-gray-600">
        Composants de champs de formulaire.
      </p>
    </div>

    <DesignDocSection
      title="InputGroup"
      description="Groupe de champ avec label, input et message d'erreur/aide."
      :in-lib="false"
    >
      <template #props>
        <PropsTable :props="inputGroupProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <div class="max-w-md space-y-4">
            <InputGroup
              v-model="textValue"
              label="Nom du dataset"
              hint="Choisissez un nom descriptif"
            />
            <InputGroup
              v-model="emailValue"
              label="Email"
              type="email"
              required
            />
            <InputGroup
              v-model="errorValue"
              label="Champ avec erreur"
              :error-message="errorMessage"
            />
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="inputGroupCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="AdminInput"
      description="Input stylisé pour les interfaces d'administration avec icône."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="adminInputCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import InputGroup from '~/components/InputGroup/InputGroup.vue'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const textValue = ref('')
const emailValue = ref('')
const errorValue = ref('')
const errorMessage = 'Ce champ est requis'

const inputGroupProps: PropDefinition[] = [
  { name: 'modelValue', type: 'string', required: true, description: 'Valeur du champ (v-model)' },
  { name: 'label', type: 'string', required: true, description: 'Label du champ' },
  { name: 'type', type: 'string', default: '\'text\'', description: 'Type d\'input', options: ['text', 'email', 'password', 'number', 'tel', 'url'] },
  { name: 'hint', type: 'string', description: 'Texte d\'aide' },
  { name: 'errorMessage', type: 'string', description: 'Message d\'erreur' },
  { name: 'required', type: 'boolean', default: 'false', description: 'Champ obligatoire' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Champ désactivé' },
]

const inputGroupCode = `
<template>
  <InputGroup
    v-model="title"
    label="Titre du dataset"
    hint="Choisissez un nom clair et descriptif"
    required
  />
</template>

<script setup>
import InputGroup from '~/components/InputGroup/InputGroup.vue'

const title = ref('')
<\/script>
`

const adminInputCode = `
<template>
  <AdminInput
    v-model="value"
    :icon="RiSearchLine"
    placeholder="Rechercher..."
  />
</template>

<script setup>
import { RiSearchLine } from '@remixicon/vue'
import AdminInput from '~/components/AdminInput.vue'

const value = ref('')
<\/script>
`
</script>
