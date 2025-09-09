<template>
  <NuxtLayout name="error">
    <div class="min-h-screen bg-white flex items-center justify-center py-30 px-8 md:py-15 md:px-4">
      <div class="flex flex-col items-center text-center max-w-2xl w-full gap-6">
        <div class="w-37 h-35 aspect-[141/134] flex items-center justify-center md:w-25 md:h-24">
          <img
            v-if="statusCode === 404"
            src="/assets/svg/errors/404.svg"
            alt="Erreur 404"
            class="w-full h-full object-contain"
          />
          <img
            v-else-if="statusCode === 403"
            src="/assets/svg/errors/403.svg"
            alt="Erreur 403"
            class="w-full h-full object-contain"
          />
          <img
            v-else-if="statusCode === 410"
            src="/assets/svg/errors/410.svg"
            alt="Erreur 410"
            class="w-full h-full object-contain"
          />
          <img
            v-else-if="statusCode >= 500"
            src="/assets/svg/errors/500.svg"
            alt="Erreur serveur"
            class="w-full h-full object-contain"
          />
          <img
            v-else
            src="/assets/svg/errors/500.svg"
            alt="Erreur"
            class="w-full h-full object-contain"
          />
        </div>
        
        <h1 class="text-6xl font-extrabold leading-none text-gray-title m-0 md:text-5xl">
          <template v-if="statusCode">{{ statusCode }}</template>
          <template v-else>Erreur</template>
        </h1>
        
        <h2 class="text-2xl font-extrabold leading-9 text-gray-title m-0 md:text-xl md:leading-8">
          <template v-if="statusCode === 404">{{ $t('Page non trouvée') }}</template>
          <template v-else-if="statusCode === 403">{{ $t('Accès interdit') }}</template>
          <template v-else-if="statusCode === 410">{{ $t('Contenu supprimé') }}</template>
          <template v-else-if="statusCode >= 500">{{ $t('Erreur interne du serveur') }}</template>
          <template v-else>{{ $t('Erreur inattendue') }}</template>
        </h2>
        
        <p class="text-base font-normal leading-6 text-gray-title m-0 text-center md:text-sm md:leading-5">
          <template v-if="statusCode === 404">
            {{ $t("Désolé, nous n'avons pas trouvé la page que vous recherchez. Il se peut que le lien soit incorrect ou que la page ait été déplacée ou supprimée. Si cela vous semble une erreur n'hésitez pas à") }}
            <NuxtLink to="/support" class="text-datagouv-dark">
              {{ $t('nous écrire') }}
            </NuxtLink>.
          </template>
          <template v-else-if="statusCode === 403">
            {{ $t("Vous n'avez pas la permission d'accéder à cette page. Cela peut être dû à des restrictions de droits ou à une authentification manquante. Si cela vous semble une erreur n'hésitez pas à") }}
            <NuxtLink to="/support" class="text-datagouv-dark">
              {{ $t('nous écrire') }}
            </NuxtLink>.
          </template>
          <template v-else-if="statusCode === 410">
            {{ $t("Ce contenu a été volontairement retiré. Il n'est plus accessible, car il a été supprimé définitivement par son producteur. Si cela vous semble une erreur n'hésitez pas à") }}
            <NuxtLink to="/support" class="text-datagouv-dark">
              {{ $t('nous écrire') }}
            </NuxtLink>.
          </template>
          <template v-else-if="statusCode >= 500">
            {{ $t("Une erreur interne est survenue. Veuillez nous excuser pour la gêne occasionnée. Si le problème persiste, merci de nous écrire avec les détails de l'erreur pour que nous puissions y remédier rapidement.") }}
          </template>
          <template v-else>
            {{ $t("Une erreur inattendue s'est produite. Veuillez nous excuser pour la gêne occasionnée. Si le problème persiste, merci de") }}
            <NuxtLink to="/support" class="text-datagouv-dark">
              {{ $t('nous écrire') }}
            </NuxtLink>
            {{ $t("avec les détails de l'erreur pour que nous puissions y remédier rapidement.") }}
            <span v-if="errorMessage" class="fr-mt-2w fr-text--sm fr-text--bold">{{ errorMessage }}</span>
          </template>
        </p>

        <div v-if="statusCode >= 500" class="fr-mt-4w fr-p-2w">
          <p class="fr-text--sm">
            <span class="fr-text--bold">{{ $t('Code erreur') }} :</span> {{ errorMessage }}
          </p>
        </div>

        <div class="mt-0">
          <BrandedButton
            v-if="statusCode >= 500"
            href="/support"
            color="primary"
            size="lg"
          >
            {{ $t("Nous écrire") }}
          </BrandedButton>
          <BrandedButton
            v-else
            href="/"
            color="primary"
            size="lg"
          >
            {{ $t("Retour à l'accueil") }}
          </BrandedButton>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { datagouv, BrandedButton } from '@datagouv/components-next'
import type { UseFetchFunction } from '@datagouv/components-next'
import CdataLink from './components/CdataLink.vue'
import { ClientOnly, TextClamp } from '#components'

const error = useError()

const app = useNuxtApp()

const i18nHead = useLocaleHead()
const runtimeConfig = useRuntimeConfig()

// Computed properties to avoid repeating error checks
const statusCode = computed(() => error.value?.statusCode)
const errorMessage = computed(() => error.value?.message)

app.vueApp.use(datagouv, {
  name: runtimeConfig.public.title,
  baseUrl: runtimeConfig.public.i18n.baseUrl, // Maybe do not use i18n config here?
  apiBase: runtimeConfig.public.apiBase,
  devApiKey: runtimeConfig.public.devApiKey,
  tabularApiUrl: runtimeConfig.public.tabularApiUrl,
  tabularApiDataserviceId: runtimeConfig.public.tabularApiDataserviceId,
  tabularAllowRemote: true,
  datasetQualityGuideUrl: runtimeConfig.public.datasetQualityGuideUrl,
  customUseFetch: useAPI as UseFetchFunction, // Why this `as` is required?
  textClamp: TextClamp,
  appLink: CdataLink,
  clientOnly: ClientOnly,
})

useHeadSafe({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang,
  },
  link: [...(i18nHead.value.link || [])],
  meta: [...(i18nHead.value.meta || [])],
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - data.gouv.fr` : 'data.gouv.fr'
  },
})
</script>
