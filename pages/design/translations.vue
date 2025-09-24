<template>
  <div class="p-8 space-y-4">
    <h1 class="text-2xl font-bold">
      Test du système de traduction
    </h1>

    <div class="space-y-2">
      <p>Test dans le template avec $t : {{ $t('Bonjour le monde') }}</p>
      <p>Test avec une phrase : {{ $t('Ceci est un test de traduction') }}</p>
      <p>Test depuis le composable : {{ messageFromComposable }}</p>
    </div>

    <h2 class="text-xl font-bold mt-6">
      Tests de pluralisation
    </h2>
    <div class="space-y-2">
      <p
        v-for="n in [0, 1, 2, 5]"
        :key="n"
      >
        {{ n }} élément(s) : {{ $t('1 jeu de données recommandé | {n} jeux de données recommandés', { n }) }}
      </p>
      <p>Test zero|one|many (0) : {{ $t('Vous n\'avez pas de message | Vous avez un message | Vous avez {n} messages', { n: 0 }) }}</p>
      <p>Test zero|one|many (1) : {{ $t('Vous n\'avez pas de message | Vous avez un message | Vous avez {n} messages', { n: 1 }) }}</p>
      <p>Test zero|one|many (3) : {{ $t('Vous n\'avez pas de message | Vous avez un message | Vous avez {n} messages', { n: 3 }) }}</p>
    </div>

    <h2 class="text-xl font-bold mt-6">
      Tests d'interpolation
    </h2>
    <div class="space-y-2">
      <p>{{ $t('Bonjour {name}, bienvenue sur {site}', { name: 'Jean', site: 'data.gouv.fr' }) }}</p>
      <p>{{ $t('Vous avez {count} message(s)', { count: 3 }) }}</p>
    </div>

    <h2 class="text-xl font-bold mt-6">
      Tests du composant TranslationT avec HTML
    </h2>
    <div class="space-y-2">
      <p>
        Test TranslationT avec slot :
        <TranslationT keypath="Cliquez sur {link} pour continuer">
          <template #link>
            <a
              href="#"
              class="text-blue-600 underline"
            >ce lien</a>
          </template>
        </TranslationT>
      </p>
      <p>
        Test TranslationT avec zero|one|many (0) :
        <TranslationT
          keypath="Bienvenue {user}, vous n'avez pas de nouveau message | Bienvenue {user}, vous avez un nouveau message | Bienvenue {user}, vous avez {n} nouveaux messages"
          :n="0"
        >
          <template #user>
            <strong class="font-bold">Marie</strong>
          </template>
        </TranslationT>
      </p>
      <p>
        Test TranslationT avec zero|one|many (1) :
        <TranslationT
          keypath="Bienvenue {user}, vous n'avez pas de nouveau message | Bienvenue {user}, vous avez un nouveau message | Bienvenue {user}, vous avez {n} nouveaux messages"
          :n="1"
        >
          <template #user>
            <strong class="font-bold">Marie</strong>
          </template>
        </TranslationT>
      </p>
      <p>
        Test TranslationT avec zero|one|many (10) :
        <TranslationT
          keypath="Bienvenue {user}, vous n'avez pas de nouveau message | Bienvenue {user}, vous avez un nouveau message | Bienvenue {user}, vous avez {n} nouveaux messages"
          :n="10"
        >
          <template #user>
            <strong class="font-bold">Marie</strong>
          </template>
        </TranslationT>
      </p>
      <p>
        Test TranslationT avec pluralisation :
        <TranslationT
          keypath="{n} résultat(s) trouvé(s) | {n} résultats trouvés"
          :n="10"
          tag="span"
        />
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import TranslationT from '~/components/TranslationT.vue'

const { t } = useTranslation()

const messageFromComposable = computed(() => t('Message depuis le composable'))
</script>
