<template>
  <SectionCollapse
    :title="$t('Informations techniques')"
    :button-text="$t('Voir les informations techniques')"
  >
    <DescriptionList>
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
        <DescriptionListTerm>{{ $t('Dernière mise à jour') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <FormattedDate :date="organization.last_modified" />
        </DescriptionListDetails>
      </div>
      <div>
        <DescriptionListTerm>{{ $t('Date de création') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <FormattedDate :date="organization.created_at" />
        </DescriptionListDetails>
      </div>
    </DescriptionList>
  </SectionCollapse>
</template>

<script setup lang="ts">
import { FormattedDate, TechnicalValue, type Organization } from '@datagouv/components-next'
import DescriptionList from '~/components/DescriptionList/DescriptionList.vue'
import DescriptionListDetails from '~/components/DescriptionList/DescriptionListDetails.vue'
import DescriptionListTerm from '~/components/DescriptionList/DescriptionListTerm.vue'
import SectionCollapse from '~/components/SectionCollapse.vue'

// Section of the Informations tab of an organization. Also shown on /design/metadata: the design
// page and the organization pages render this same component, so they cannot drift apart.
defineProps<{
  organization: Organization
}>()
</script>
