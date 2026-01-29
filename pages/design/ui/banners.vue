<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Bannières
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour afficher des messages, alertes et notifications.
      </p>
    </div>

    <DesignDocSection
      title="SimpleBanner"
      description="Bannière simple pour afficher des messages avec différents niveaux d'importance."
      :in-lib="true"
    >
      <template #props>
        <PropsTable :props="simpleBannerProps" />
      </template>

      <template #preview>
        <ComponentPreview :show-controls="false">
          <div class="space-y-4">
            <SimpleBanner
              v-for="type in bannerTypes"
              :key="type"
              :type="type"
            >
              Ceci est une bannière de type <strong>{{ type }}</strong>. Elle peut contenir du texte et des liens.
            </SimpleBanner>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample
          title="Utilisation"
          :code="simpleBannerCode"
        />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="BannerAction"
      description="Bannière avec bouton d'action, idéale pour les call-to-action."
      :in-lib="true"
    >
      <template #code>
        <CodeExample :code="bannerActionCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="BannerNotif"
      description="Bannière de notification locale, composant cdata pas encore porté dans la lib."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="bannerNotifCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="Alert"
      description="Composant d'alerte pour messages contextuels avec différents états."
      :in-lib="false"
    >
      <template #props>
        <PropsTable :props="alertProps" />
      </template>

      <template #preview>
        <ComponentPreview :show-controls="false">
          <div class="space-y-4">
            <Alert type="info">
              <template #title>
                Information
              </template>
              Ceci est un message d'information.
            </Alert>
            <Alert type="success">
              <template #title>
                Succès
              </template>
              L'opération a réussi.
            </Alert>
            <Alert type="warning">
              <template #title>
                Attention
              </template>
              Attention à cette action.
            </Alert>
            <Alert type="error">
              <template #title>
                Erreur
              </template>
              Une erreur s'est produite.
            </Alert>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="alertCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { SimpleBanner } from '@datagouv/components-next'
import Alert from '~/components/Alert/Alert.vue'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const bannerTypes = ['primary', 'primary-frame', 'warning', 'gray', 'danger', 'success', 'pink'] as const

const simpleBannerProps: PropDefinition[] = [
  { name: 'type', type: 'string', required: true, description: 'Type de la bannière', options: [...bannerTypes] },
]

const alertProps: PropDefinition[] = [
  { name: 'type', type: 'string', required: true, description: 'Type d\'alerte', options: ['info', 'success', 'warning', 'error'] },
  { name: 'size', type: 'string', default: '\'md\'', description: 'Taille de l\'alerte', options: ['sm', 'md'] },
  { name: 'titleLevel', type: 'string', default: '\'h3\'', description: 'Niveau de titre pour l\'accessibilité' },
]

const simpleBannerCode = `
<template>
  <SimpleBanner type="primary">
    Message important à afficher aux utilisateurs.
  </SimpleBanner>

  <SimpleBanner type="warning">
    Attention: cette action est irréversible.
  </SimpleBanner>
</template>

<script setup>
import { SimpleBanner } from '@datagouv/components-next'
<\/script>
`

const bannerActionCode = `
<template>
  <BannerAction>
    <template #title>
      Complétez votre profil
    </template>
    <template #content>
      Ajoutez plus d'informations pour améliorer votre visibilité.
    </template>
    <template #button>
      <BrandedButton color="primary">
        Compléter
      </BrandedButton>
    </template>
  </BannerAction>
</template>

<script setup>
import { BannerAction, BrandedButton } from '@datagouv/components-next'
<\/script>
`

const bannerNotifCode = `
<template>
  <BannerNotif />
</template>

<script setup>
import BannerNotif from '~/components/BannerNotif.vue'
<\/script>
`

const alertCode = `
<template>
  <Alert type="info">
    <template #title>Information</template>
    Contenu de l'alerte.
  </Alert>
</template>

<script setup>
import Alert from '~/components/Alert/Alert.vue'
<\/script>
`
</script>
