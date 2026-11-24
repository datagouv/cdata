<template>
  <div class="min-w-0 divide-y divide-gray-default">
    <section class="grid min-w-0 gap-6 py-8 first:pt-0">
      <h3 class="m-0 text-sm/5 font-medium uppercase text-gray-title">
        {{ $t('Informations techniques') }}
      </h3>
      <DescriptionList>
        <div>
          <DescriptionListTerm>{{ $t('Dernière mise à jour') }}</DescriptionListTerm>
          <DescriptionListDetails>
            <FormattedDate :date="organization.last_modified" />
          </DescriptionListDetails>
        </div>
        <div>
          <DescriptionListTerm>{{ $t('Identifiant') }}</DescriptionListTerm>
          <DescriptionListDetails>
            <TechnicalValue
              :value="organization.id"
              :label="$t(`Copier l'identifiant de l'organisation`)"
              :copied-label="$t(`Identifiant de l'organisation copié !`)"
            />
          </DescriptionListDetails>
        </div>
        <div>
          <DescriptionListTerm>{{ $t('Date de création') }}</DescriptionListTerm>
          <DescriptionListDetails>
            <FormattedDate :date="organization.created_at" />
          </DescriptionListDetails>
        </div>
      </DescriptionList>
    </section>
    <section class="grid min-w-0 gap-6 py-8 last:pb-0">
      <h3 class="m-0 text-sm/5 font-medium uppercase text-gray-title">
        {{ $t('Intégrer sur votre site') }}
      </h3>
      <article
        v-for="embed in embeds"
        :key="embed.type"
        class="min-w-0 space-y-2"
      >
        <h4 class="m-0 text-sm/5 font-medium text-gray-title">
          {{ embed.title }}
        </h4>
        <CodeBlock
          :code="getOrganizationOEmbedHtml(embed.type, organization.id)"
          language="HTML"
          :label="$t(`Copier l'intégration`)"
          :copied-label="$t('Intégration copiée !')"
        />
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { CodeBlock, FormattedDate, TechnicalValue, getOrganizationOEmbedHtml, type Organization } from '@datagouv/components-next'
import DescriptionList from '~/components/DescriptionList/DescriptionList.vue'
import DescriptionListDetails from '~/components/DescriptionList/DescriptionListDetails.vue'
import DescriptionListTerm from '~/components/DescriptionList/DescriptionListTerm.vue'

defineProps<{
  organization: Organization
}>()

const embeds = [
  { type: 'search-dataset', title: 'La recherche de jeux de données de l’organisation' },
  { type: 'search-dataservice', title: 'La recherche des API de l’organisation' },
  { type: 'list-reuse', title: 'La liste des réutilisations de l’organisation' },
]
</script>
