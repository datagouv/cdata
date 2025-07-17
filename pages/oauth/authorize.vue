<template>
  <div class="bg-gray-some py-6 space-y-6">
    <div class="container bg-white max-w-xl p-6 border border-gray-lower">
      <LoadingBlock
        :status
      >
        <div class="space-y-8">
          <h1 class="text-2xl font-normal">
            <i18n-t
              keypath="{external} voudrait accéder à votre compte {site}."
              scope="global"
            >
              <template #external>
                <strong class="font-bold">{{ data.client.name }}</strong>
              </template>
              <template #site>
                <strong class="font-bold">{{ config.public.title }}</strong>
              </template>
            </i18n-t>
          </h1>

          <hr>

          <div>
            <p class="mb-0">
              {{ $t('{external} demande les droits suivants :', { external: data.client.name }) }}
            </p>

            <dl class="divide-y pl-0">
              <div class="py-4">
                <dt class="font-bold">
                  {{ $t('Accéder à votre profil') }}
                </dt>
                <dd class="pl-0">
                  {{ $t('Lire votre profil, votre adresse e-mail, les organisations auxquelles vous appartenez, vos publications') }}
                </dd>
              </div>
              <div class="py-4">
                <dt class="font-bold">
                  {{ $t('Publier des données') }}
                </dt>
                <dd class="pl-0">
                  {{ $t(`Publier des jeux de données, des réutilisations, s'abonner`) }}
                </dd>
              </div>
            </dl>
          </div>
          <form
            class="gap-4 flex flex-col sm:flex-row"
            :action="authorizeUrl"
            method="POST"
          >
            <input
              type="hidden"
              name="scope"
              :value="data.scopes.join(' ')"
            >

            <BrandedButton
              class="w-full"
              color="primary"
              type="submit"
              name="accept"
            >
              {{ $t('Accepter') }}
            </BrandedButton>
            <BrandedButton
              class="w-full"
              color="secondary"
              type="submit"
              name="decline"
            >
              {{ $t('Refuser') }}
            </BrandedButton>
          </form>
        </div>
      </LoadingBlock>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'

const { t } = useI18n()
const config = useRuntimeConfig()

useSeoMeta({ title: t('Connexion') })

const route = useRoute()

const { data, status } = await useAPI<{ client: { name: string }, scopes: Array<string> }>('/fr/oauth/client_info', { query: route.query })

const authorizeUrl = computed(() => {
  const queryString = new URLSearchParams(route.query).toString()
  return `${config.public.apiBase}/fr/oauth/authorize?${queryString}`
})
</script>
