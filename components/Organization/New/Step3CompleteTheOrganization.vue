<template>
  <PaddedContainer>
    <SimpleBanner
      type="primary"
      class="-mb-3"
    >
      <div class="flex flex-wrap gap-3">
        <div class="flex-none">
          <NuxtImg
            src="/illustrations/organization.svg"
            width="50"
            loading="lazy"
            alt=""
          />
        </div>
        <div class="flex-1">
          <p class="m-0 font-bold">
            {{ $t('Votre organisation a été créée !') }}
          </p>
          <p class="m-0 text-xs">
            {{ $t('Vous pouvez maintenant publier du contenu ou inviter des membres à rejoindre votre organisation.') }}
          </p>
        </div>
      </div>
    </SimpleBanner>
    <article class="my-6 p-6 !border border-neutral-200 fr-enlarge-link">
      <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
        <div class="fr-col-auto">
          <OrganizationLogo
            :organization
            size-class="size-16"
          />
        </div>
        <div class="fr-col">
          <h4 class="fr-mb-1v fr-grid-row">
            <a
              :href="organization.page"
              class="text-gray-title"
            >
              {{ organization.name }}
              <small v-if="organization.acronym">{{ organization.acronym }}</small>
            </a>
          </h4>
          <Suspense>
            <TextClamp
              class="fr-mt-1w fr-mb-2w fr-hidden fr-unhidden-sm overflow-wrap-anywhere"
              :auto-resize="true"
              :text="removeMarkdownSync(organization.description)"
              :max-lines="2"
            />
          </Suspense>
        </div>
      </div>
    </article>
    <div class="fr-grid-row fr-grid-row--right gap-3">
      <BrandedButton
        color="secondary"
        :href="`/admin/organizations/${organization.id}/profile`"
      >
        {{ $t("Gérer l’organisation") }}
      </BrandedButton>
      <BrandedButton
        href="/admin/reuses/new"
        color="primary"
      >
        {{ $t("Publiez une réutilisation") }}
      </BrandedButton>
      <BrandedButton
        href="/admin/datasets/new"
        color="primary"
      >
        {{ $t("Publier un jeu de données") }}
      </BrandedButton>
    </div>
    <Alert
      v-if="errors?.length"
      type="error"
      class="fr-mt-2w fr-mb-2w"
    >
      <template #title>
        {{ $t("Une erreur est survenue | Des erreurs sont survenues", errors.length) }}
      </template>
      <ul v-if="errors.length > 1">
        <li
          v-for="error in errors"
          :key="error"
        >
          {{ error }}
        </li>
      </ul>
      <p v-else>
        {{ errors[0] }}
      </p>
    </Alert>
  </PaddedContainer>
</template>

<script setup lang="ts">
import { BrandedButton, OrganizationLogo, PaddedContainer } from '@datagouv/components-next'
import { removeMarkdownSync, SimpleBanner, type Organization } from '@datagouv/components-next'

defineProps<{
  organization: Organization
  errors?: Array<string>
}>()
</script>
