<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Breadcrumbs
      </h1>
      <p class="mt-2 text-gray-600">
        Fil d'Ariane pour la navigation hiérarchique.
      </p>
    </div>

    <DesignDocSection
      title="Breadcrumb / BreadcrumbItem"
      description="Composant de fil d'Ariane pour indiquer la position dans l'arborescence."
      :in-lib="false"
    >
      <template #preview>
        <ComponentPreview>
          <Breadcrumb>
            <BreadcrumbItem to="/">
              Accueil
            </BreadcrumbItem>
            <BreadcrumbItem to="/datasets">
              Jeux de données
            </BreadcrumbItem>
            <BreadcrumbItem to="/datasets/xxx">
              Mon dataset
            </BreadcrumbItem>
          </Breadcrumb>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="breadcrumbCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'

const breadcrumbCode = `
<template>
  <Breadcrumb>
    <BreadcrumbItem to="/">Accueil</BreadcrumbItem>
    <BreadcrumbItem to="/datasets">Jeux de données</BreadcrumbItem>
    <BreadcrumbItem to="/datasets/xxx">Mon dataset</BreadcrumbItem>
  </Breadcrumb>
</template>

<script setup>
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
<\/script>
`
</script>
