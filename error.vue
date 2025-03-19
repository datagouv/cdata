<template>
  <NuxtLayout>
    <div class="fr-container fr-py-9v">
      <div class="prose">
        <template v-if="error && error.statusCode === 404">
          <h1>{{ $t('Error 404') }}</h1>
          <p>{{ $t("The page you're looking for cannot be found.") }}</p>
        </template>
        <template v-else>
          <h1>{{ $t('Error') }}</h1>
          <p>{{ $t('Something did not work as expected.') }}</p>

          <p v-if="error">
            <strong>{{ error.message }}</strong>
          </p>
        </template>
        <p>
          <a
            class="fr-link fr-reset-link"
            href="/"
          >
            {{ $t('Home') }}
          </a>
        </p>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const { t } = useI18n()
const error = useError()
</script>
