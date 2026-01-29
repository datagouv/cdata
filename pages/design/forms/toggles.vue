<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Toggles
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour les choix binaires et les boutons radio.
      </p>
    </div>

    <DesignDocSection
      title="ToggleSwitch"
      description="Interrupteur pour activer/désactiver une option."
      :in-lib="false"
    >
      <template #preview>
        <ComponentPreview>
          <div class="flex items-center gap-4">
            <ToggleSwitch
              v-model="toggleValue"
              label="Activer la fonctionnalité"
            />
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="toggleSwitchCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="RadioButtons"
      description="Groupe de boutons radio pour un choix unique."
      :in-lib="false"
    >
      <template #preview>
        <ComponentPreview>
          <RadioButtons
            v-model="radioValue"
            label="Choisissez une option"
            :options="radioOptions"
          />
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="radioButtonsCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import RadioButtons from '~/components/RadioButtons.vue'
import ToggleSwitch from '~/components/Form/ToggleSwitch.vue'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'

const toggleValue = ref(false)
const radioValue = ref('option1')
const radioOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
]

const toggleSwitchCode = `
<template>
  <ToggleSwitch v-model="isEnabled" />
</template>

<script setup>
import ToggleSwitch from '~/components/ToggleSwitch/ToggleSwitch.vue'

const isEnabled = ref(false)
<\/script>
`

const radioButtonsCode = `
<template>
  <RadioButtons
    v-model="selectedOption"
    :options="[
      { value: 'a', label: 'Choix A' },
      { value: 'b', label: 'Choix B' },
      { value: 'c', label: 'Choix C' },
    ]"
  />
</template>

<script setup>
import RadioButtons from '~/components/RadioButtons/RadioButtons.vue'

const selectedOption = ref('a')
<\/script>
`
</script>
