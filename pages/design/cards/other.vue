<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Autres Cards
      </h1>
      <p class="mt-2 text-gray-600">
        Autres composants de type carte pour différents usages.
      </p>
    </div>

    <DesignDocSection
      title="ActionCard"
      description="Carte avec icône et bouton d'action."
      :in-lib="false"
    >
      <template #props>
        <PropsTable :props="actionCardProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <div class="grid gap-4 md:grid-cols-2">
            <ActionCard
              title="Publier un jeu de données"
              icon="/nuxt_images/bouquet.svg"
              actions-alignment="end"
              content="Partagez vos données ouvertes avec la communauté."
            >
              <template #actions>
                <BrandedButton
                  color="primary"
                  size="sm"
                >
                  Commencer
                </BrandedButton>
              </template>
            </ActionCard>
            <ActionCard
              title="Créer une réutilisation"
              icon="/nuxt_images/forum.svg"
              actions-alignment="end"
              type="primary"
              content="Montrez comment vous utilisez les données ouvertes."
            >
              <template #actions>
                <BrandedButton
                  color="secondary"
                  size="sm"
                >
                  Créer
                </BrandedButton>
              </template>
            </ActionCard>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="actionCardCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="BrandCard"
      description="Carte pour présenter un produit ou service data.gouv.fr."
      :in-lib="false"
    >
      <template #props>
        <PropsTable :props="brandCardProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <BrandCard
            title="API Entreprise"
            tagline="Simplifiez les démarches des entreprises"
            description="L'API Entreprise permet aux administrations d'accéder aux données des entreprises."
            cta-url="https://api.gouv.fr/les-api/api-entreprise"
            cta-label="Découvrir"
            size="medium"
          />
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="brandCardCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="SupportCard"
      description="Carte pour les liens vers le support et l'aide."
      :in-lib="false"
    >
      <template #preview>
        <ComponentPreview>
          <div class="grid gap-4 md:grid-cols-2">
            <SupportCard
              image="/nuxt_images/forum.svg"
              title="Forum"
              description="Échangez avec la communauté et partagez vos retours."
            >
              <template #link>
                <BrandedButton
                  href="https://forum.data.gouv.fr"
                  color="tertiary"
                  :icon="RiArrowRightLine"
                  :icon-right="true"
                >
                  Voir le forum
                </BrandedButton>
              </template>
            </SupportCard>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="supportCardCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { BrandedButton } from '@datagouv/components-next'
import { RiArrowRightLine } from '@remixicon/vue'
import ActionCard from '~/components/ActionCard/ActionCard.vue'
import BrandCard from '~/components/Brand/BrandCard.vue'
import SupportCard from '~/components/Support/Card.vue'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const actionCardProps: PropDefinition[] = [
  { name: 'title', type: 'string', required: true, description: 'Titre de la carte' },
  { name: 'icon', type: 'string', required: true, description: 'Chemin vers l\'image de l\'icône' },
  { name: 'actionsAlignment', type: 'AxisAlignment', required: true, description: 'Alignement des actions', options: ['start', 'center', 'end'] },
  { name: 'content', type: 'string', description: 'Contenu textuel' },
  { name: 'type', type: 'string', default: '\'default\'', description: 'Type de carte', options: ['default', 'primary'] },
]

const brandCardProps: PropDefinition[] = [
  { name: 'title', type: 'string', description: 'Titre du produit' },
  { name: 'tagline', type: 'string', description: 'Slogan court' },
  { name: 'description', type: 'string', description: 'Description du produit' },
  { name: 'ctaUrl', type: 'string', description: 'URL du bouton d\'action' },
  { name: 'ctaLabel', type: 'string', description: 'Texte du bouton' },
  { name: 'size', type: 'string', default: '\'medium\'', description: 'Taille de la carte', options: ['medium', 'large'] },
]

const actionCardCode = `
<template>
  <ActionCard
    title="Mon action"
    :icon="RiDatabase2Line"
    actions-alignment="right"
    content="Description de l'action."
  >
    <template #actions>
      <BrandedButton color="primary" size="sm">
        Action
      </BrandedButton>
    </template>
  </ActionCard>
</template>

<script setup>
import ActionCard from '~/components/ActionCard/ActionCard.vue'
<\/script>
`

const brandCardCode = `
<template>
  <BrandCard
    title="Mon produit"
    tagline="Slogan accrocheur"
    description="Description détaillée."
    cta-url="https://example.com"
    cta-label="Découvrir"
  />
</template>

<script setup>
import BrandCard from '~/components/Brand/BrandCard.vue'
<\/script>
`

const supportCardCode = `
<template>
  <SupportCard
    image="/path/to/image.svg"
    title="Support"
    description="Besoin d'aide ?"
  >
    <template #link>
      <BrandedButton href="/support" color="tertiary">
        Contacter
      </BrandedButton>
    </template>
  </SupportCard>
</template>

<script setup>
import SupportCard from '~/components/Support/Card.vue'
<\/script>
`
</script>
