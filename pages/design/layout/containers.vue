<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Containers
      </h1>
      <p class="mt-2 text-gray-600">
        Composants de mise en page et conteneurs.
      </p>
    </div>

    <DesignDocSection
      title="DescriptionList"
      description="Liste de définitions pour afficher des paires clé/valeur."
      :in-lib="false"
    >
      <template #preview>
        <ComponentPreview>
          <DescriptionList>
            <div>
              <DescriptionListTerm>Titre</DescriptionListTerm>
              <DescriptionListDetails>Mon dataset</DescriptionListDetails>
            </div>
            <div>
              <DescriptionListTerm>Licence</DescriptionListTerm>
              <DescriptionListDetails>Licence Ouverte</DescriptionListDetails>
            </div>
            <div>
              <DescriptionListTerm>Fréquence</DescriptionListTerm>
              <DescriptionListDetails>Mensuelle</DescriptionListDetails>
            </div>
          </DescriptionList>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="descriptionListCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="PaddedContainer"
      description="Conteneur avec padding standardisé."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="paddedContainerCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="Container"
      description="Conteneur responsive avec largeur maximale."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="containerCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import DescriptionList from '~/components/DescriptionList/DescriptionList.vue'
import DescriptionListDetails from '~/components/DescriptionList/DescriptionListDetails.vue'
import DescriptionListTerm from '~/components/DescriptionList/DescriptionListTerm.vue'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'

const descriptionListCode = `
<template>
  <DescriptionList>
    <div>
      <DescriptionListTerm>Clé</DescriptionListTerm>
      <DescriptionListDetails>Valeur</DescriptionListDetails>
    </div>
    <div>
      <DescriptionListTerm>Autre clé</DescriptionListTerm>
      <DescriptionListDetails>Autre valeur</DescriptionListDetails>
    </div>
  </DescriptionList>
</template>

<script setup>
import DescriptionList from '~/components/DescriptionList/DescriptionList.vue'
import DescriptionListTerm from '~/components/DescriptionList/DescriptionListTerm.vue'
import DescriptionListDetails from '~/components/DescriptionList/DescriptionListDetails.vue'
<\/script>
`

const paddedContainerCode = `
<template>
  <PaddedContainer>
    <h1>Mon contenu</h1>
    <p>Avec du padding uniforme.</p>
  </PaddedContainer>
</template>

<script setup>
import PaddedContainer from '~/components/PaddedContainer.vue'
<\/script>
`

const containerCode = `
<template>
  <!-- Conteneur responsive standard -->
  <Container>
    <slot />
  </Container>
</template>

<script setup>
import Container from '~/components/Container.vue'
<\/script>
`
</script>
