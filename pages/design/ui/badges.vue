<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Badges
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour afficher des étiquettes, tags et indicateurs de statut.
      </p>
    </div>

    <DesignDocSection
      title="Tag"
      description="Étiquette simple pour afficher des mots-clés ou catégories."
      :in-lib="false"
    >
      <template #preview>
        <ComponentPreview>
          <div class="flex flex-wrap gap-2">
            <Tag type="secondary">
              environnement
            </Tag>
            <Tag type="secondary">
              transport
            </Tag>
            <Tag type="secondary">
              santé
            </Tag>
            <Tag type="secondary">
              éducation
            </Tag>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="tagCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="AdminBadge"
      description="Badges pour l'interface d'administration affichant le statut des objets (dataset, dataservice, reuse)."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="adminBadgeCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="AccessTypeBadge"
      description="Badge indiquant le type d'accès aux données (ouvert, restreint, etc.)."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="accessTypeBadgeCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import Tag from '~/components/Tag.vue'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'

const tagCode = `
<template>
  <Tag>environnement</Tag>
</template>

<script setup>
import Tag from '~/components/Tag.vue'
<\/script>
`

const adminBadgeCode = `
<template>
  <!-- Composants locaux pour les badges admin -->
  <DatasetBadge :dataset="dataset" />
  <DataserviceBadge :dataservice="dataservice" />
  <ReuseBadge :reuse="reuse" />
</template>

<script setup>
import DatasetBadge from '~/components/AdminBadge/DatasetBadge.vue'
import DataserviceBadge from '~/components/AdminBadge/DataserviceBadge.vue'
import ReuseBadge from '~/components/AdminBadge/ReuseBadge.vue'
<\/script>
`

const accessTypeBadgeCode = `
<template>
  <AccessTypeBadge :access-type="accessType" />
</template>

<script setup>
import AccessTypeBadge from '~/components/AccessTypes/AccessTypeBadge.vue'

const accessType = { value: 'open', label: 'Ouvert' }
<\/script>
`
</script>
