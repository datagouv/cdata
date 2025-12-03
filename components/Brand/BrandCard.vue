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
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M7.99992 1.33331C11.6819 1.33331 14.6666 4.31798 14.6666 7.99998C14.6666 11.682 11.6819 14.6666 7.99992 14.6666C4.31792 14.6666 1.33325 11.682 1.33325 7.99998C1.33325 4.31798 4.31792 1.33331 7.99992 1.33331ZM9.31325 8.66665H6.68659C6.78725 10.2926 7.25192 11.82 7.99992 13.168C8.76813 11.7843 9.21688 10.2463 9.31325 8.66665ZM5.35125 8.66665H2.70792C2.97296 10.7627 4.44922 12.5054 6.47325 13.1113C5.81553 11.7162 5.4345 10.2068 5.35125 8.66665ZM13.2919 8.66665H10.6486C10.5653 10.2068 10.1843 11.7162 9.52659 13.1113C11.5506 12.5054 13.0269 10.7627 13.2919 8.66665ZM7.99992 2.83198C7.23171 4.21561 6.78296 5.75366 6.68659 7.33331H9.31259C9.21642 5.75371 8.7679 4.21567 7.99992 2.83198ZM6.47325 2.88865C4.44922 3.49461 2.97296 5.23721 2.70792 7.33331H5.35125C5.4345 5.79317 5.81553 4.28377 6.47325 2.88865ZM9.52659 2.88865C10.1843 4.28377 10.5653 5.79317 10.6486 7.33331H13.2919C13.0269 5.23721 11.5506 3.49461 9.52659 2.88865Z"
                  fill="#3558A2"
                />
              </svg>
              Voir le site
            </a>
            <a
              v-if="props.code"
              :href="props.code"
              target="_blank"
              rel="noopener noreferrer"
              class="product-link !no-underline product-link-custom"
              style="text-decoration: none !important;"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.92207 12.4353C3.72207 12.302 3.55007 12.132 3.34873 11.8913C3.24423 11.7634 3.14067 11.6347 3.03807 11.5053C2.7294 11.122 2.53473 10.9453 2.3334 10.8726C2.16693 10.8129 2.03102 10.6894 1.95557 10.5295C1.88012 10.3695 1.87131 10.1861 1.93107 10.0196C1.99083 9.85317 2.11427 9.71726 2.27424 9.64181C2.43421 9.56636 2.6176 9.55755 2.78407 9.61731C3.2854 9.79731 3.62473 10.1073 4.08207 10.676C4.0194 10.598 4.30873 10.9606 4.37073 11.0353C4.4974 11.1866 4.59073 11.2786 4.66407 11.3273C4.80007 11.4186 5.0554 11.458 5.43073 11.4206C5.44607 11.166 5.4934 10.9186 5.5654 10.6906C3.58673 10.2066 2.46673 8.93064 2.46673 6.42664C2.46673 5.59997 2.7134 4.85597 3.17207 4.23197C3.02673 3.63597 3.04873 2.91531 3.3734 2.10397C3.41025 2.0122 3.46705 1.92977 3.53969 1.86266C3.61233 1.79555 3.699 1.74545 3.7934 1.71597C3.8474 1.69997 3.87807 1.69264 3.93207 1.68464C4.4674 1.60264 5.2234 1.79797 6.20873 2.41531C6.79593 2.27803 7.39704 2.20913 8.00007 2.20997C8.60807 2.20997 9.21207 2.27931 9.7894 2.41531C10.7741 1.79331 11.5314 1.59797 12.0707 1.68464C12.1274 1.69331 12.1754 1.70464 12.2161 1.71797C12.3086 1.74849 12.3934 1.79893 12.4643 1.86574C12.5353 1.93254 12.5907 2.01409 12.6267 2.10464C12.9514 2.91531 12.9734 3.63597 12.8281 4.23131C13.2887 4.85531 13.5334 5.59464 13.5334 6.42664C13.5334 8.93131 12.4174 10.2033 10.4387 10.688C10.5221 10.9646 10.5654 11.274 10.5654 11.608C10.5655 12.2115 10.5628 12.8151 10.5574 13.4186C10.7071 13.4513 10.841 13.5345 10.9366 13.6544C11.0321 13.7742 11.0834 13.9232 11.082 14.0765C11.0805 14.2297 11.0262 14.3777 10.9284 14.4957C10.8305 14.6136 10.6951 14.6942 10.5447 14.724C9.7854 14.876 9.22273 14.3693 9.22273 13.7073L9.22407 13.41L9.2274 12.94C9.23073 12.468 9.23207 12.048 9.23207 11.608C9.23207 11.1433 9.11007 10.84 8.94873 10.7013C8.50807 10.3213 8.7314 9.59797 9.30873 9.53331C11.2867 9.31131 12.2001 8.54531 12.2001 6.42664C12.2001 5.78997 11.9921 5.26397 11.5914 4.82397C11.507 4.73147 11.4503 4.61706 11.4279 4.49385C11.4055 4.37064 11.4183 4.24361 11.4647 4.12731C11.5754 3.85131 11.6227 3.48931 11.5287 3.05131L11.5221 3.05331C11.1947 3.14597 10.7821 3.34664 10.2834 3.68597C10.203 3.74054 10.1116 3.77688 10.0157 3.79242C9.91976 3.80797 9.8216 3.80236 9.72807 3.77597C9.16534 3.62017 8.58397 3.54189 8.00007 3.54331C7.40673 3.54331 6.81873 3.62264 6.27207 3.77664C6.17888 3.80281 6.08111 3.80838 5.98556 3.79295C5.89 3.77752 5.79895 3.74147 5.71873 3.68731C5.2174 3.34931 4.80273 3.14931 4.4734 3.05597C4.3774 3.49131 4.42473 3.85197 4.53473 4.12731C4.58127 4.24355 4.59414 4.37054 4.57185 4.49375C4.54957 4.61696 4.49304 4.7314 4.40873 4.82397C4.01073 5.25997 3.80007 5.79597 3.80007 6.42664C3.80007 8.54131 4.71407 9.31197 6.6814 9.53331C7.25807 9.59797 7.48207 10.318 7.04407 10.6986C6.91607 10.8106 6.75807 11.1866 6.75807 11.608V13.708C6.75807 14.3653 6.2014 14.858 5.4514 14.7266C5.29924 14.6999 5.16109 14.6212 5.06055 14.5039C4.96 14.3866 4.90331 14.2381 4.90016 14.0836C4.89701 13.9292 4.9476 13.7784 5.04328 13.6571C5.13896 13.5358 5.27379 13.4515 5.42473 13.4186V12.7586C4.81807 12.7993 4.31673 12.7 3.92207 12.4353Z"
                  fill="#3558A2"
                />
              </svg>
              Code
            </a>
            <a
              v-if="props.contact"
              :href="props.contact"
              target="_blank"
              rel="noopener noreferrer"
              class="product-link !no-underline product-link-custom"
              style="text-decoration: none !important;"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M1.99992 2H13.9999C14.3681 2 14.6666 2.29848 14.6666 2.66667V13.3333C14.6666 13.7015 14.3681 14 13.9999 14H1.99992C1.63173 14 1.33325 13.7015 1.33325 13.3333V2.66667C1.33325 2.29848 1.63173 2 1.99992 2ZM13.3333 4.82533L8.04792 9.55867L2.66659 4.81067V12.6667H13.3333V4.82533ZM3.00725 3.33333L8.04059 7.77467L13.0013 3.33333H3.00725Z"
                  fill="#3558A2"
                />
              </svg>
              Contact
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
            <svg
              width="1em"
              height="1em"
              viewBox="0 0 16 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="inline-block align-middle ml-2"
              style="vertical-align: middle; position: relative; top: -1px;"
            >
              <path
                d="M10.9403 12.8572L7.58776 9.40909L8.47163 8.5L13.333 13.5L8.47163 18.5L7.58776 17.5909L10.9403 14.1429H3.33301V12.8572H10.9403Z"
                fill="#3558A2"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

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
