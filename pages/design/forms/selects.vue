<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Selects
      </h1>
      <p class="mt-2 text-gray-600">
        Composants de sélection et de recherche.
      </p>
    </div>

    <DesignDocSection
      title="SearchableSelect"
      description="Sélecteur avec recherche intégrée pour de longues listes d'options."
      :in-lib="false"
    >
      <template #props>
        <PropsTable :props="searchableSelectProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <div class="max-w-md">
            <SearchableSelect
              v-model="selectedOption"
              label="Choisir une option"
              :multiple="false"
              :options="options"
              :display-value="(opt: any) => opt?.name"
              placeholder="Rechercher..."
            />
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="searchableSelectCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="OrganizationSelect"
      description="Sélecteur spécialisé pour choisir une organisation parmi celles de l'utilisateur."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="organizationSelectCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="TagsSelect"
      description="Sélecteur multiple pour les tags/mots-clés avec autocomplétion."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="tagsSelectCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="LicenseSelect"
      description="Sélecteur pour choisir une licence parmi celles disponibles."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="licenseSelectCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import SearchableSelect from '~/components/SearchableSelect.vue'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const selectedOption = ref(null)
const options = [
  { id: 1, name: 'Agriculture' },
  { id: 2, name: 'Économie' },
  { id: 3, name: 'Éducation' },
  { id: 4, name: 'Environnement' },
  { id: 5, name: 'Santé' },
  { id: 6, name: 'Transport' },
]

const searchableSelectProps: PropDefinition[] = [
  { name: 'modelValue', type: 'T | T[] | null', required: true, description: 'Valeur sélectionnée (v-model)' },
  { name: 'label', type: 'string', required: true, description: 'Label du champ' },
  { name: 'options', type: 'T[]', required: true, description: 'Liste des options disponibles' },
  { name: 'displayValue', type: '(option: T) => string', required: true, description: 'Fonction pour afficher le label' },
  { name: 'placeholder', type: 'string', description: 'Placeholder du champ de recherche' },
  { name: 'multiple', type: 'boolean', default: 'false', description: 'Permet la sélection multiple' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Affiche un loader' },
  { name: 'required', type: 'boolean', default: 'false', description: 'Champ obligatoire' },
]

const searchableSelectCode = `
<template>
  <SearchableSelect
    v-model="selectedOption"
    label="Choisir une catégorie"
    :options="options"
    :display-value="(opt) => opt?.name"
    placeholder="Rechercher..."
  />
</template>

<script setup>
import SearchableSelect from '~/components/SearchableSelect.vue'

const selectedOption = ref(null)
const options = [
  { id: 1, name: 'Option 1' },
  { id: 2, name: 'Option 2' },
]
<\/script>
`

const organizationSelectCode = `
<template>
  <OrganizationSelect
    v-model="selectedOrg"
    :organizations="userOrganizations"
  />
</template>

<script setup>
import OrganizationSelect from '~/components/OrganizationSelect.vue'

const selectedOrg = ref(null)
const userOrganizations = ref([])
<\/script>
`

const tagsSelectCode = `
<template>
  <TagsSelect
    v-model="selectedTags"
    placeholder="Ajouter des tags..."
  />
</template>

<script setup>
import TagsSelect from '~/components/TagsSelect/TagsSelect.vue'

const selectedTags = ref([])
<\/script>
`

const licenseSelectCode = `
<template>
  <LicenseSelect v-model="selectedLicense" />
</template>

<script setup>
import LicenseSelect from '~/components/License/LicenseSelect.vue'

const selectedLicense = ref(null)
<\/script>
`
</script>
