<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Accordions
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour afficher du contenu repliable.
      </p>
    </div>

    <DesignDocSection
      title="AccordionGroup / Accordion"
      description="Groupe d'accordéons avec support des états DSFR."
      :in-lib="false"
    >
      <template #props>
        <PropsTable :props="accordionProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <AccordionGroup>
            <Accordion
              id="accordion-1"
              title="Premier accordéon"
            >
              <p>Contenu du premier accordéon. Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            </Accordion>
            <Accordion
              id="accordion-2"
              title="Deuxième accordéon"
            >
              <p>Contenu du deuxième accordéon. Duis aute irure dolor in reprehenderit.</p>
            </Accordion>
            <Accordion
              id="accordion-3"
              title="Troisième accordéon (warning)"
              state="warning"
            >
              <p>Cet accordéon a un état warning.</p>
            </Accordion>
          </AccordionGroup>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="accordionGroupCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="ResourceAccordion"
      description="Accordéon spécialisé pour afficher les ressources d'un dataset. Nécessite un dataset complet avec ses ressources chargées."
      :in-lib="true"
    >
      <template #code>
        <CodeExample :code="resourceAccordionCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import Accordion from '~/components/Accordion/Accordion.global.vue'
import AccordionGroup from '~/components/Accordion/AccordionGroup.global.vue'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const accordionProps: PropDefinition[] = [
  { name: 'id', type: 'string', required: true, description: 'ID unique de l\'accordéon' },
  { name: 'title', type: 'string', required: true, description: 'Titre de l\'accordéon' },
  { name: 'state', type: 'string', default: '\'default\'', description: 'État visuel', options: ['default', 'error', 'info', 'success', 'warning', 'disabled'] },
]

const accordionGroupCode = `
<template>
  <AccordionGroup>
    <Accordion id="acc-1" title="Premier accordéon">
      Contenu ici...
    </Accordion>
    <Accordion id="acc-2" title="Deuxième accordéon">
      Autre contenu...
    </Accordion>
  </AccordionGroup>
</template>

<script setup>
import Accordion from '~/components/Accordion/Accordion.global.vue'
import AccordionGroup from '~/components/Accordion/AccordionGroup.global.vue'
<\/script>
`

const resourceAccordionCode = `
<template>
  <ResourceAccordion
    :resource="resource"
    :dataset="dataset"
  />
</template>

<script setup>
import { ResourceAccordion } from '@datagouv/components-next'
<\/script>
`
</script>
