<template>
  <div
    :class="[
      'flex flex-col h-full',
      props.size === 'large' ? 'sm:flex-row sm:items-stretch flex-col' : 'flex-col',
      props.border ? 'border border-gray-default relative overflow-hidden' : '',
    ]"
  >
    <div :class="props.size === 'large' ? 'sm:w-1/2 w-full flex-shrink-0' : 'w-full'">
      <div
        class="inset-0 flex"
        :class="[
          props.size === 'large' ? 'sm:min-h-[26rem] items-start justify-center' : 'items-start justify-center',
        ]"
      >
        <div
          class="flex-1 flex flex-col w-full"
          :class="props.size === 'large' ? 'justify-start h-full' : ''"
        >
          <template v-if="props.useStaticImage && props.imageSrc">
            <NuxtImg
              :src="props.imageSrc"
              :alt="props.imageAlt || ''"
              :srcset="props.imageSrc + ', ' + props.imageSrc.replace('.png', '@2x.png') + ' 2x'"
              :class="props.size === 'large' ? 'w-full h-full sm:-mb-16 self-start object-contain object-top' : 'w-full object-contain object-top'"
            />
          </template>
        </div>
      </div>
    </div>
    <div
      :class="[
        'bg-white',
        props.size === 'large' ? 'sm:p-16 p-0 sm:w-1/2 w-full flex-shrink-0' : 'p-4 w-full h-full',
        props.size === 'large' ? 'mt-6 sm:mt-0' : '',
      ]"
    >
      <div class="flex flex-col justify-between h-full">
        <div class="flex flex-col gap-y-1">
          <p
            v-if="props.theme"
            class="uppercase tracking-wider theme-card"
          >
            {{ props.theme }}
          </p>
          <p
            v-if="props.size === 'large'"
            class="text-4xl font-bold"
            v-html="props.title"
          />
          <p
            v-if="props.description"
            class="text-gray-dark"
            :class="props.size === 'large' ? 'text-left text-xl' : 'text-base'"
          >
            {{ props.description }}
          </p>
          <p
            v-if="props.tagline"
            class="font-semibold text-gray-dark"
          >
            {{ props.tagline }}
          </p>
          <div
            v-if="props.site || props.code || props.contact"
            class="product-links mb-4"
          >
            <a
              v-if="props.site"
              :href="props.site"
              target="_blank"
              rel="noopener noreferrer"
              class="product-link !no-underline product-link-custom"
              style="text-decoration: none !important;"
            >
              <RiGlobalLine
                class="size-4"
                aria-hidden="true"
              />
              {{ $t('Voir le site') }}
            </a>
            <a
              v-if="props.code"
              :href="props.code"
              target="_blank"
              rel="noopener noreferrer"
              class="product-link !no-underline product-link-custom"
              style="text-decoration: none !important;"
            >
              <RiGithubLine
                class="size-4"
                aria-hidden="true"
              />
              {{ $t('Code') }}
            </a>
            <a
              v-if="props.contact"
              :href="props.contact"
              target="_blank"
              rel="noopener noreferrer"
              class="product-link !no-underline product-link-custom"
              style="text-decoration: none !important;"
            >
              <RiMailLine
                class="size-4"
                aria-hidden="true"
              />
              {{ $t('Contact') }}
            </a>
          </div>
        </div>
        <div
          v-if="props.ctaUrl"
          class="mt-auto text-right"
        >
          <a
            :href="props.ctaUrl"
            class="text-new-primary inline-flex items-center"
          >
            {{ props.ctaLabel }}
            <RiArrowRightLine
              class="size-3 ml-2"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RiArrowRightLine, RiGithubLine, RiGlobalLine, RiMailLine } from '@remixicon/vue'

interface Props {
  theme?: string
  description?: string
  tagline?: string
  ctaUrl?: string
  ctaLabel?: string
  site?: string
  code?: string
  contact?: string
  size?: 'medium' | 'large'
  border?: boolean
  imageSrc?: string
  imageAlt?: string
  useStaticImage?: boolean
  title?: string
}

const props = defineProps<Props>()
</script>

  <style scoped>
  .product-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .product-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none !important;
    color: #3558A2;
    font-weight: 500;
    font-size: 0.875rem;
    transition: color 0.2s ease;
    width: fit-content;
  }

  .product-link:hover {
    text-decoration: none !important;
    color: #2a4a8a;
  }

  .theme-card {
    color: #929292;
    font-family: 'Marianne';
    font-weight: bold;
    font-size: 0.8rem;
  }
  </style>
