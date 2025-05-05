<template>
  <nav
    rol="navigation"
    :aria-label="$t(`You're here:`)"
    class="fr-breadcrumb mb-5"
  >
    <ol class="fr-breadcrumb__list">
      <slot />
    </ol>
  </nav>
</template>
