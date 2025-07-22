/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{html,js,vue,ts}',
    './composables/**/*.{html,js,vue,ts}',
    './content/**/*.{html,js,vue,ts}',
    './assets/**/*.{html,js,vue,ts}',
    './pages/**/*.{html,js,vue,ts}',
    './plugins/**/*.{html,js,vue,ts}',
    './utils/**/*.{html,js,vue,ts}',
    './datagouv-components/src/**/*.{html,js,vue,ts}',
  ],
  theme: {
    extend: {
      typography: theme => ({
        neutral: {
          css: {
            '--tw-prose-bullets': theme('colors.neutral[800]'),
          },
        },
      }),
    },
  },
}
