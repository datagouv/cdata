<template>
  <div
    v-if="user"
    class="space-y-8"
  >
    <BannerNotif
      v-for="type in ['primary', 'warning']"
      :key="type"
      :type
      :icon="RiSendPlaneLine"
      class="mb-4"
      badge="Transfert en attente"
      :user
      :date="new Date('2020-05-12T23:50:21.817Z')"
    >
      <template #title>
        <code class="text-gray-medium bg-gray-lower px-1 text-sm rounded-sm">antonin.garonne@data.gouv.fr</code> a effectué une demande de transfert
      </template>
      <template #subtitle>
        <LinkToSubject
          type="Dataset"
          :subject="dataset"
        />
        vers votre organization
        <a
          href="#"
          class="link"
        >Ministère de l'intérieur</a>
      </template>

      <template #body>
        Je transfère parce que je démissionne. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas nesciunt ex laborum quos quisquam necessitatibus, consequuntur voluptatibus, sed repellendus beatae nobis corrupti, eligendi facere at vitae maxime architecto nostrum dolores.
      </template>

      <template #buttons>
        <BrandedButton
          color="primary"
          size="xs"
          :icon="RiCheckLine"
        >
          Accepter
        </BrandedButton>
        <BrandedButton
          color="danger"
          size="xs"
          :icon="RiCloseLine"
        >
          Refuser
        </BrandedButton>
      </template>
    </BannerNotif>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, type DatasetV2, type User } from '@datagouv/components-next'
import { RiCheckLine, RiCloseLine, RiSendPlaneLine } from '@remixicon/vue'

const { data: user } = await useAPI<User>(`/api/1/users/antonin-garrone/`)
const { data: dataset } = await useAPI<DatasetV2>(`/api/2/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/`)
</script>
