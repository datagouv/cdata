<template>
  <span class="inline-flex gap-0.5">
    <span
      v-for="i in 3"
      :key="i"
      class="w-1 h-1 bg-current rounded-full animate-bounce"
      :style="{ animationDelay: `${(i - 1) * 150}ms` }"
    />
  </span>
</template>
