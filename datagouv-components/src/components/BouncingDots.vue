<template>
  <span class="inline-flex gap-0.5 items-end h-2">
    <span
      v-for="i in 3"
      :key="i"
      class="w-1 h-1 bg-current rounded-full animate-[bounce-dot_0.6s_ease-in-out_infinite]"
      :style="`animation-delay: ${(i - 1) * 100}ms !important`"
    />
  </span>
</template>

<style>
@keyframes bounce-dot {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}
</style>
