<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Modals
      </h1>
      <p class="mt-2 text-gray-600">
        Fenêtres modales pour les dialogues et confirmations.
      </p>
    </div>

    <DesignDocSection
      title="Modal"
      description="Fenêtre modale basique avec overlay."
      :in-lib="false"
    >
      <template #props>
        <PropsTable :props="modalProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <BrandedButton
            color="primary"
            @click="showModal = true"
          >
            Ouvrir la modal
          </BrandedButton>
          <Modal
            :opened="showModal"
            title="Titre de la modal"
            @close="showModal = false"
          >
            <p>Contenu de la modal. Vous pouvez mettre n'importe quel contenu ici.</p>
            <template #footer>
              <BrandedButton
                color="secondary"
                @click="showModal = false"
              >
                Annuler
              </BrandedButton>
              <BrandedButton
                color="primary"
                @click="showModal = false"
              >
                Confirmer
              </BrandedButton>
            </template>
          </Modal>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="modalCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="ModalWithButton"
      description="Modal avec bouton de déclenchement intégré."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="modalWithButtonCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="ConfirmationModal"
      description="Modal de confirmation pour les actions destructives."
      :in-lib="false"
    >
      <template #code>
        <CodeExample :code="confirmationModalCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { BrandedButton } from '@datagouv/components-next'
import Modal from '~/components/Modal/Modal.client.vue'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const showModal = ref(false)

const modalProps: PropDefinition[] = [
  { name: 'opened', type: 'boolean', default: 'false', description: 'Contrôle l\'ouverture de la modal' },
  { name: 'title', type: 'string', required: true, description: 'Titre de la modal (requis pour l\'accessibilité)' },
  { name: 'showTitle', type: 'boolean', default: 'true', description: 'Affiche le titre (sinon utilisé comme aria-label)' },
  { name: 'size', type: 'string', default: '\'md\'', description: 'Taille de la modal', options: ['sm', 'md', 'lg', 'xl', 'fullscreen'] },
  { name: 'form', type: 'boolean', default: 'false', description: 'Rend la modal comme un formulaire' },
]

const modalCode = `
<template>
  <BrandedButton @click="showModal = true">
    Ouvrir
  </BrandedButton>

  <Modal
    :opened="showModal"
    title="Ma modal"
    @close="showModal = false"
  >
    <p>Contenu de la modal</p>

    <template #footer>
      <BrandedButton color="secondary" @click="showModal = false">
        Annuler
      </BrandedButton>
      <BrandedButton color="primary" @click="handleConfirm">
        Confirmer
      </BrandedButton>
    </template>
  </Modal>
</template>

<script setup>
import Modal from '~/components/Modal/Modal.client.vue'

const showModal = ref(false)
<\/script>
`

const modalWithButtonCode = `
<template>
  <ModalWithButton
    title="Supprimer l'élément"
    button-label="Supprimer"
    button-color="danger"
  >
    <p>Êtes-vous sûr de vouloir supprimer cet élément ?</p>

    <template #footer="{ close }">
      <BrandedButton color="secondary" @click="close">
        Annuler
      </BrandedButton>
      <BrandedButton color="danger" @click="handleDelete">
        Confirmer la suppression
      </BrandedButton>
    </template>
  </ModalWithButton>
</template>

<script setup>
import ModalWithButton from '~/components/Modal/ModalWithButton.vue'
<\/script>
`

const confirmationModalCode = `
<template>
  <ConfirmationModal
    v-model="showConfirm"
    title="Confirmer la suppression"
    message="Cette action est irréversible."
    confirm-label="Supprimer"
    confirm-color="danger"
    @confirm="handleDelete"
  />
</template>

<script setup>
import ConfirmationModal from '~/components/Modal/ConfirmationModal.vue'

const showConfirm = ref(false)
const handleDelete = () => {
  // ...
}
<\/script>
`
</script>
