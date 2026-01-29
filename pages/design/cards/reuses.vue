<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Reuse Cards
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour afficher les réutilisations.
      </p>
    </div>

    <DesignDocSection
      title="ReuseCard"
      description="Carte verticale pour afficher une réutilisation."
      :in-lib="true"
    >
      <template #props>
        <PropsTable :props="reuseCardProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <LoadingBlock
            :status="reuseStatus"
            :data="reuse"
          >
            <template #default="{ data }">
              <div class="max-w-sm">
                <ReuseCard :reuse="data" />
              </div>
            </template>
          </LoadingBlock>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="reuseCardCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="ReuseHorizontalCard"
      description="Carte horizontale pour afficher une réutilisation."
      :in-lib="true"
    >
      <template #preview>
        <ComponentPreview>
          <div class="grid gap-4 md:grid-cols-2">
            <LoadingBlock
              v-for="r in reuses.slice(0, 2)"
              :key="r.id"
              :status="reusesStatus"
              :data="r"
            >
              <template #default="{ data }">
                <ReuseHorizontalCard :reuse="data" />
              </template>
            </LoadingBlock>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="reuseHorizontalCardCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="EmbedsReuseCard"
      description="Version embeddable de la carte réutilisation, charge les données à partir du slug."
      :in-lib="false"
    >
      <template #preview>
        <ComponentPreview>
          <div class="grid gap-4 md:grid-cols-3">
            <EmbedsReuseCard :slug="settings.reuseSlug" />
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="embedsReuseCardCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { LoadingBlock, ReuseCard, ReuseHorizontalCard } from '@datagouv/components-next'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const { settings } = useDesignSettings()
const { reuse, reuseStatus, reuses, reusesStatus } = useDesignData()

const reuseCardProps: PropDefinition[] = [
  { name: 'reuse', type: 'Reuse', required: true, description: 'Objet réutilisation à afficher' },
]

const reuseCardCode = `
<template>
  <ReuseCard :reuse="reuse" />
</template>

<script setup>
import { ReuseCard } from '@datagouv/components-next'

const { data: reuse } = await useAPI('/api/1/reuses/xxx/')
<\/script>
`

const reuseHorizontalCardCode = `
<template>
  <ReuseHorizontalCard :reuse="reuse" />
</template>

<script setup>
import { ReuseHorizontalCard } from '@datagouv/components-next'
<\/script>
`

const embedsReuseCardCode = `
<template>
  <EmbedsReuseCard slug="ma-reutilisation" />
</template>

<script setup>
import EmbedsReuseCard from '~/components/Embeds/ReuseCard.global.vue'
<\/script>
`
</script>
