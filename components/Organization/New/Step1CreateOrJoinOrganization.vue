<template>
  <div class="flex items-start md:flex-wrap">
    <PaddedContainer class="mb-6">
      <ActionCard
        actions-alignment="center"
        :title="t('Rejoindre une organisation')"
        :content="t(`Une organisation est une entité dans laquelle les utilisateurs peuvent collaborer. Les jeux de données publiés dans une organisation peuvent être édités par ses membres.`)"
        icon="/illustrations/organization.svg"
        :stretch-height="true"
      >
        <template #actions>
          <div class="fr-col-12 flex items-start relative">
            <div class="fr-col-12 fr-col-lg-8">
              <OrganizationSearch />
            </div>
            <div class="fr-col-12 fr-col-lg-4 ml-auto">
              <div class="flex items-center md:flex-wrap">
                <p class="flex-1 text-center ml-3v m-0">
                  {{ t('ou') }}
                </p>
                <div class="flex-1 ml-3v m-0">
                  <BrandedButton
                    color="primary"
                    @click="$emit('start')"
                  >
                    {{ t("Créer une organisation") }}
                  </BrandedButton>
                </div>
              </div>
            </div>
          </div>
        </template>
      </ActionCard>
    </PaddedContainer>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'

const { t } = useTranslation()

defineEmits<{
  (event: 'start'): void
}>()
</script>
