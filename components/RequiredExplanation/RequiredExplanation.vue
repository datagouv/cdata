<template>
  <i18n-t
    keypath="Les champs précédés d'une étoile ({markup}) sont obligatoires."
    tag="p"
    class="mt-0 mb-2 text-xs"
    scope="global"
  >
    <template #markup>
      <span class="text-primary">*</span>
    </template>
  </i18n-t>
</template>
