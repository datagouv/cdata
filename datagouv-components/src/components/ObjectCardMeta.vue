<template>
  <!--
    A separator is drawn before every item but the first. When the row wraps, the separator of the
    item starting the new line falls outside the row and is clipped; the clip margin keeps the focus
    rings of the items visible.
  -->
  <div
    class="flex flex-wrap items-center gap-x-4 gap-y-1 max-w-full overflow-clip [overflow-clip-margin:6px] text-sm/6 text-gray-secondary
      *:min-h-6 *:not-first:relative
      *:not-first:before:absolute *:not-first:before:-start-[9px] *:not-first:before:top-0 *:not-first:before:h-6
      *:not-first:before:border-s *:not-first:before:border-gray-default *:not-first:before:pointer-events-none"
  >
    <slot />
  </div>
</template>
